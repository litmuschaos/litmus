import type { MutationFunction } from '@apollo/client';
import { Color, Intent } from '@harnessio/design-system';
import {
  ConfirmationDialog,
  ConfirmationDialogProps,
  Container,
  Layout,
  Page,
  Tab,
  TabNavigation,
  Tabs,
  Text,
  useToaster,
  useToggleOpen,
  VisualYamlSelectedView,
  VisualYamlToggle
} from '@harnessio/uicore';
import type { FormikProps } from 'formik';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { isEmpty } from 'lodash-es';
import { Icon } from '@harnessio/icons';
import type {
  RunChaosExperimentRequest,
  RunChaosExperimentResponse,
  SaveChaosExperimentResponse,
  SaveChaosExperimentRequest
} from '@api/core';
import { useUpdateSearchParams, useSearchParams, useRouteWithBaseUrl } from '@hooks';
import type { ExperimentMetadata } from '@db';
import { KubernetesExperimentManifest, StudioErrorState, StudioMode, StudioTabs } from '@models';
import { useStrings } from '@strings';
import { getHash, getScope } from '@utils';
import StudioOverviewView from '@views/StudioOverview';
import { ParentComponentErrorWrapper } from '@errors';
import experimentYamlService, { KubernetesYamlService } from 'services/experiment';
import { InfrastructureType } from '@api/entities';
import StudioScheduleView from '@views/StudioSchedule';
import LitmusBreadCrumbs from '@components/LitmusBreadCrumbs';
import ExperimentYamlBuilderView from '@views/ExperimentYAMLBuilder';
import ExperimentVisualBuilderView from '@views/ExperimentVisualBuilder/ExperimentVisualBuilder';
import MainNav from '@components/MainNav';
import SideNav from '@components/SideNav';
import StudioActionButtons from './StudioActionButtons';
import css from './ChaosStudio.module.scss';
interface ChaosStudioViewProps {
  saveChaosExperimentMutation: MutationFunction<SaveChaosExperimentResponse, SaveChaosExperimentRequest>;
  runChaosExperimentMutation: MutationFunction<RunChaosExperimentResponse, RunChaosExperimentRequest>;
  loading: {
    saveChaosExperiment: boolean;
    runChaosExperiment: boolean;
  };
  mode: StudioMode;
  rightSideBar?: React.ReactElement;
  allowSwitchToRunHistory?: boolean;
}

export default function ChaosStudioView({
  saveChaosExperimentMutation,
  runChaosExperimentMutation,
  loading,
  mode,
  rightSideBar,
  allowSwitchToRunHistory
}: ChaosStudioViewProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const { showError, showSuccess } = useToaster();
  const paths = useRouteWithBaseUrl();
  const history = useHistory();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const selectedTabId = searchParams.get('tab') as StudioTabs;
  const experimentName = searchParams.get('experimentName') ?? 'chaos-experiment';
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType | undefined;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(infrastructureType);
  const viewFilter = (searchParams.get('view') as VisualYamlSelectedView) ?? VisualYamlSelectedView.VISUAL;
  const setViewFilter = (view: VisualYamlSelectedView): void => updateSearchParams({ view });
  const [error, setError] = React.useState<StudioErrorState>({ OVERVIEW: undefined, BUILDER: undefined });
  const [hasFaults, setHasFaults] = React.useState<boolean>(false);
  const studioOverviewRef = React.useRef<FormikProps<ExperimentMetadata>>();
  const experimentHashKeyForClone = getHash();
  const { showWarning } = useToaster();
  const {
    isOpen: isOpenDiscardExperimentDialog,
    open: openDiscardExperimentDialog,
    close: closeDiscardExperimentDialog
  } = useToggleOpen();
  // const safeToNavigate = searchParams.get('unsavedChanges') !== 'true';
  const setSafeToNavigate = (safe: boolean): void => {
    updateSearchParams({ unsavedChanges: (!safe).toString() });
  };

  React.useEffect(() => {
    if (!selectedTabId) {
      updateSearchParams({
        tab: StudioTabs.OVERVIEW,
        infrastructureType: infrastructureType ?? InfrastructureType.KUBERNETES
      });
    } else if (selectedTabId === StudioTabs.BUILDER || selectedTabId === StudioTabs.SCHEDULE) {
      experimentHandler?.getExperiment(experimentKey).then(async experiment => {
        // set safe to navigate based on idb value
        setSafeToNavigate(!experiment?.unsavedChanges);
        // check if overview screen details are available else set error
        if (experiment?.name && experiment?.chaosInfrastructure?.id) {
          setError(prevErrors => ({
            ...prevErrors,
            OVERVIEW: false
          }));
        }
        setHasFaults(experimentHandler?.doesExperimentHaveFaults(experiment?.manifest) ?? false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentKey, selectedTabId]);

  const handleTabChange = (tabID: StudioTabs): void => {
    switch (tabID) {
      case StudioTabs.OVERVIEW:
        updateSearchParams({ tab: StudioTabs.OVERVIEW });
        break;
      case StudioTabs.BUILDER:
        if (selectedTabId === StudioTabs.OVERVIEW) {
          studioOverviewRef.current?.handleSubmit();
        } else {
          updateSearchParams({ tab: StudioTabs.BUILDER });
        }
        break;
      case StudioTabs.SCHEDULE:
        if (selectedTabId === StudioTabs.BUILDER && !error.BUILDER && hasFaults) {
          updateSearchParams({ tab: StudioTabs.SCHEDULE });
        }
        break;
    }
  };

  const saveExperimentHandler = async (): Promise<void> => {
    if (loading.saveChaosExperiment) return;
    // Check only for last step because on reload error states are not saved
    if (error.BUILDER) {
      showError(getString('validationError'));
      return;
    }
    // <!-- if no error then get yaml -->
    const experiment = await experimentHandler?.getExperiment(experimentKey);
    if (!experiment) return showError(getString('noData.message'));
    let yaml = experiment.manifest;
    // This step modifies the chaos engine hence only required for Kubernetes experiment
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      yaml = (experimentHandler as KubernetesYamlService)?.postProcessExperimentManifest(
        experiment.manifest as KubernetesExperimentManifest
      );

      /**
       * If probeRef is not present in the manifest then return the fault name
       * where the ref is missing otherwise return undefined
       */
      const probeWithoutAnnotation = await (
        experimentHandler as KubernetesYamlService
      )?.checkProbesInExperimentManifest(experiment?.manifest as KubernetesExperimentManifest);

      /**
       * Checks if probe metadata is already present in the manifest
       *
       * Returns true if probe metadata is present
       */
      const doesProbeExists = await (experimentHandler as KubernetesYamlService)?.doesProbeMetadataExists(
        experiment?.manifest as KubernetesExperimentManifest
      );

      if (doesProbeExists) {
        showWarning(getString('probeMetadataExists'));
      }

      // Generate new probes if annotation is missing but probes are present. Else case return error
      if (probeWithoutAnnotation && !doesProbeExists) {
        showError(`${getString('probeInFault')} ${probeWithoutAnnotation} ${getString('probeNotAttachedToRef')}`);
        return;
      }
    }

    saveChaosExperimentMutation({
      variables: {
        projectID: scope.projectID,
        request: {
          id: mode !== StudioMode.CLONE ? experimentKey : experimentHashKeyForClone,
          name: experiment.name,
          description: experiment.description,
          tags: experiment.tags,
          infraID: experiment.chaosInfrastructure?.id ?? '',
          manifest: JSON.stringify(yaml)
        }
      },
      onCompleted: () => {
        setSafeToNavigate(true);
        showSuccess(getString('expSaved'));
        if (mode === StudioMode.CLONE)
          history.push({
            pathname: paths.toEditExperiment({ experimentKey: experimentHashKeyForClone }),
            search: `tab=${StudioTabs.BUILDER}&unsavedChanges=false`
          });
      }
    });
  };

  const runExperimentHandler = (): void => {
    runChaosExperimentMutation({
      variables: {
        projectID: scope.projectID,
        experimentID: experimentKey
      },
      onCompleted: response => {
        showSuccess(getString('reRunSuccessful'));
        setSafeToNavigate(true);
        const notifyID = response.runChaosExperiment.notifyID;
        if (!isEmpty(notifyID)) {
          history.push(
            paths.toExperimentRunDetailsViaNotifyID({
              experimentID: experimentKey,
              notifyID: notifyID
            })
          );
        } else {
          history.push(paths.toExperiments());
        }
      }
    });
  };

  const discardExperimentDialogProps: ConfirmationDialogProps = {
    isOpen: isOpenDiscardExperimentDialog,
    contentText: getString('discardExperiment'),
    titleText: getString('confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onClose: (isConfirmed: boolean) => {
      setSafeToNavigate(false);
      if (isConfirmed) {
        experimentHandler?.deleteExperiment(experimentKey);
        history.push(paths.toExperiments());
      }
      closeDiscardExperimentDialog();
    }
  };

  const discardExperimentDialog = <ConfirmationDialog {...discardExperimentDialogProps} />;

  return (
    <div className={css.mainContainer}>
      <Container flex className={css.leftSideBar}>
        <MainNav />
        <SideNav />
      </Container>
      <div className={css.subContainer}>
        {/* <!-- page header--> */}
        <Page.Header
          className={css.pageHeader}
          size={'small'}
          title={
            <Layout.Vertical>
              <Layout.Horizontal>
                <ParentComponentErrorWrapper>
                  <LitmusBreadCrumbs
                    links={[
                      {
                        label: 'Chaos Experiments',
                        url: paths.toExperiments()
                      }
                    ]}
                  />
                </ParentComponentErrorWrapper>
              </Layout.Horizontal>
              <div className={css.pipelineStudioTitle}>{getString('chaosStudio')}</div>
            </Layout.Vertical>
          }
          toolbar={
            mode === StudioMode.EDIT ? (
              <TabNavigation
                size={'small'}
                links={[
                  {
                    label: getString('chaosStudio'),
                    to: paths.toEditExperiment({ experimentKey: experimentKey }) + `?tab=${StudioTabs.BUILDER}`
                  },
                  {
                    label: getString('runHistory'),
                    to: paths.toExperimentRunHistory({ experimentID: experimentKey }),
                    disabled: !allowSwitchToRunHistory
                  }
                ]}
              />
            ) : (
              <></>
            )
          }
        />
        {/* <!-- experiment title and action buttons --> */}
        <div className={css.titleBar}>
          <div className={css.breadcrumbsMenu}>
            <div className={css.pipelineMetadataContainer}>
              <Layout.Horizontal className={css.pipelineNameContainer}>
                <Text
                  className={css.pipelineName}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 340
                  }}
                  tooltip={experimentName}
                >
                  {experimentName}
                </Text>
              </Layout.Horizontal>
            </div>
          </div>
          {/* <!-- visual yaml toggle--> */}
          {selectedTabId === StudioTabs.BUILDER && (
            <VisualYamlToggle
              disableToggle={error.BUILDER}
              showDisableToggleReason={true}
              disableToggleReasonContent={
                <Layout.Vertical>
                  <Text
                    color={Color.WHITE}
                    font={{ size: 'small' }}
                    padding={{ top: 'small', bottom: 'xsmall', left: 'medium', right: 'medium' }}
                  >
                    {getString('invalidYaml')}
                  </Text>
                  <Text
                    color={Color.WHITE}
                    font={{ size: 'small' }}
                    padding={{ top: 'xsmall', bottom: 'small', left: 'medium', right: 'medium' }}
                  >
                    {getString('fixAllErrors')}
                  </Text>
                </Layout.Vertical>
              }
              className={css.visualYamlToggle}
              selectedView={viewFilter}
              onChange={val => !error.BUILDER && setViewFilter(val)}
            />
          )}
          {/* <!-- studio action buttons--> */}
          <div className={css.savePublishContainer}>
            <StudioActionButtons
              disabled={error.OVERVIEW || error.BUILDER || !hasFaults}
              loading={loading.saveChaosExperiment || loading.runChaosExperiment}
              handleDiscard={() => {
                setSafeToNavigate(true);
                openDiscardExperimentDialog();
              }}
              saveExperimentHandler={saveExperimentHandler}
              runExperimentHandler={runExperimentHandler}
            />
          </div>
        </div>

        {/* <!-- diagram section --> */}
        <section className={css.setupShell}>
          <Tabs id="chaosStudioTabs" onChange={handleTabChange} selectedTabId={selectedTabId}>
            <Tab
              id={StudioTabs.OVERVIEW}
              panel={
                <StudioOverviewView
                  disabledExperimentTypeSwitching={!(mode === StudioMode.CREATE)}
                  formRef={studioOverviewRef}
                  openDiscardDialog={() => {
                    setSafeToNavigate(true);
                    openDiscardExperimentDialog();
                  }}
                  setViewFilter={setViewFilter}
                  setError={setError}
                />
              }
              title={
                <span className={css.tab}>
                  <Icon name={'edit'} height={16} size={16} />
                  {getString('overview')}
                </span>
              }
            />
            <Icon
              name="chevron-right"
              height={20}
              size={20}
              margin={{ right: 'small', left: 'small' }}
              color={'grey400'}
              style={{ alignSelf: 'center' }}
            />
            <Tab
              id={StudioTabs.BUILDER}
              disabled={selectedTabId !== StudioTabs.SCHEDULE && (error.OVERVIEW === undefined || error.OVERVIEW)}
              panel={
                viewFilter === VisualYamlSelectedView.YAML ? (
                  <ExperimentYamlBuilderView setError={setError} setHasFaults={setHasFaults} />
                ) : (
                  <ExperimentVisualBuilderView
                    handleTabChange={handleTabChange}
                    setHasFaults={setHasFaults}
                    setViewFilter={setViewFilter}
                  />
                )
              }
              title={
                <span className={css.tab}>
                  <Icon name={'chaos-scenario-builder'} height={16} size={16} />
                  {getString('experimentBuilder')}
                </span>
              }
            />
            <Icon
              name="chevron-right"
              height={20}
              size={20}
              margin={{ right: 'small', left: 'small' }}
              color={'grey400'}
              style={{ alignSelf: 'center' }}
            />
            <Tab
              id={StudioTabs.SCHEDULE}
              disabled={error.BUILDER || !hasFaults}
              panel={<StudioScheduleView mode={mode} />}
              title={
                <span className={css.tab}>
                  <Icon name={'calendar'} height={16} size={16} />
                  {getString('schedule')}
                </span>
              }
            />
          </Tabs>
        </section>
        {discardExperimentDialog}
      </div>
      {/* <!-- right sidebar --> */}
      {rightSideBar && mode === StudioMode.EDIT && <Container className={css.rightSideBar}>{rightSideBar}</Container>}
    </div>
  );
}
