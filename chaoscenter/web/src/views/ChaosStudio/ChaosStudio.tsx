import type { MutationFunction } from '@apollo/client';
import { Intent } from '@harness/design-system';
import {
  ConfirmationDialog,
  Container,
  Layout,
  Tab,
  TabNavigation,
  Tabs,
  useToaster,
  useToggleOpen,
  VisualYamlSelectedView
} from '@harness/uicore';
import type { FormikProps } from 'formik';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Icon } from '@harness/icons';
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
import ExperimentVisualBuilderView from '@views/ExperimentVisualBuilder';
import StudioOverviewView from '@views/StudioOverview';
import experimentYamlService, { KubernetesYamlService } from 'services/experiment';
import { InfrastructureType } from '@api/entities';
import StudioScheduleView from '@views/StudioSchedule';
import DefaultLayoutTemplate from '@components/DefaultLayout';
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
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler();
  const [viewFilter, setViewFilter] = React.useState<VisualYamlSelectedView>(VisualYamlSelectedView.VISUAL);
  const [error, setError] = React.useState<StudioErrorState>({ OVERVIEW: undefined, BUILDER: undefined });
  const [hasFaults, setHasFaults] = React.useState<boolean>(false);
  const studioOverviewRef = React.useRef<FormikProps<ExperimentMetadata>>();
  const experimentHashKeyForClone = getHash();

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
      experimentHandler?.getExperiment(experimentKey).then(experiment => {
        setSafeToNavigate(!experiment?.unsavedChanges);
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
        if (notifyID !== '') {
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

  const { isOpen, open: openDiscardDialog, close: closeConfirmationDialog } = useToggleOpen();

  const confirmationDialogProps = {
    usePortal: true,
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
      closeConfirmationDialog();
    }
  };

  const confirmationDialog = <ConfirmationDialog isOpen={isOpen} {...confirmationDialogProps} />;

  const breadcrumbs = [
    {
      label: 'Chaos Experiments',
      url: paths.toExperiments()
    }
  ];

  const toolbar = (
    <Layout.Vertical flex={{ alignItems: 'flex-end' }} spacing={'medium'}>
      {mode === StudioMode.EDIT && (
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
      )}
      <StudioActionButtons
        disabled={error.OVERVIEW || error.BUILDER || !hasFaults}
        loading={loading.saveChaosExperiment || loading.runChaosExperiment}
        handleDiscard={() => {
          setSafeToNavigate(true);
          openDiscardDialog();
        }}
        saveExperimentHandler={saveExperimentHandler}
        runExperimentHandler={runExperimentHandler}
      />
    </Layout.Vertical>
  );

  const title = (
    <React.Fragment>
      {experimentName}
      <div className={css.pipelineStudioTitle}>{getString('chaosStudio')}</div>
      {/* TODO: Un-comment this when Monaco editor is implemented */}
      {/* {selectedTabId === StudioTabs.BUILDER && (
        <VisualYamlToggle
          className={css.visualYamlToggle}
          selectedView={viewFilter}
          onChange={val => !error.BUILDER && setViewFilter(val)}
        />
      )} */}
    </React.Fragment>
  );

  const rightSideBarForLayout = mode === StudioMode.EDIT ? rightSideBar : undefined;

  return (
    <DefaultLayoutTemplate
      breadcrumbs={breadcrumbs}
      headerToolbar={toolbar}
      rightSideBar={rightSideBarForLayout}
      title={title}
      noPadding
    >
      <Container height={'100%'}>
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
                    openDiscardDialog();
                  }}
                  setViewFilter={setViewFilter}
                  setError={setError}
                />
              }
              title={
                <span className={css.tab}>
                  <Icon size={16} name="advanced" />
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
                  <></>
                ) : (
                  <ExperimentVisualBuilderView handleTabChange={handleTabChange} setHasFaults={setHasFaults} />
                )
              }
              title={
                <span className={css.tab}>
                  <Icon name={'chaos-scenario-builder'} height={16} size={16} />
                  {getString('experimentBuilder')}
                </span>
              }
            />
            {/* Do not hide Icon and Tab together...trust me bro <(o_o)> */}
            <Icon
              name="chevron-right"
              height={20}
              size={20}
              margin={{ right: 'small', left: 'small' }}
              color={'grey400'}
              style={{ alignSelf: 'center' }}
            />
            {/* )} */}
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
      </Container>
      {confirmationDialog}
    </DefaultLayoutTemplate>
  );
}
