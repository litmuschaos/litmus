import React from 'react';
import { Intent } from '@blueprintjs/core';
import { FontVariation } from '@harnessio/design-system';
import {
  Button,
  ButtonSize,
  ButtonVariation,
  ConfirmationDialog,
  Container,
  Layout,
  Tabs,
  Text,
  useToaster,
  useToggleOpen
} from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { useParams } from 'react-router-dom';
import type { FormikProps } from 'formik';
import { cloneDeep, isEmpty, isEqual } from 'lodash-es';
import { DrawerTypes } from '@components/Drawer/Drawer';
import Drawer from '@components/Drawer';
import { useStrings } from '@strings';
import TargetApplicationTabController from '@controllers/TargetApplicationTab';
import type { FaultData } from '@models';
import { useSearchParams } from '@hooks';
import { InfrastructureType } from '@api/entities';
import experimentYamlService from '@services/experiment';
import type { GetFaultTunablesOperation } from '@services/experiment/ExperimentYamlService';
import type { ServiceIdentifiers } from '@db';
import SelectProbesTabController from '@controllers/SelectProbesTab';
import SelectProbesDetailController from '@controllers/SelectProbesDetail';
import type { ChaosProbesSelectionProps } from '@controllers/SelectProbesTab/types';
import { ProbesTab as NewProbes, FaultTunablesTab } from './Tabs';
import type { TuneExperimentForm } from './Tabs';
import SelectProbeModeView from './Tabs/Probes/SelectProbeMode';
import css from './ExperimentCreationFaultConfiguration.module.scss';

interface ExperimentCreationTuneFaultProps {
  isOpen: boolean;
  onClose: () => void;
  initialFaultData: FaultData | undefined;
  infraID: string | undefined;
  environmentID: string | undefined;
  faultTuneOperation: GetFaultTunablesOperation;
  initialServiceIdentifiers: ServiceIdentifiers | undefined;
}

enum TuneFaultTab {
  TargetApplication = 'targetApplication',
  TuneFault = 'tuneFault',
  Probes = 'probes',
  SelectProbes = 'selectProbes'
}

export default function ExperimentCreationTuneFaultView({
  isOpen,
  onClose,
  initialFaultData,
  infraID,
  // environmentID,
  faultTuneOperation
}: // initialServiceIdentifiers
ExperimentCreationTuneFaultProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const { showError } = useToaster();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType | undefined;
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const [faultData, setFaultData] = React.useState<FaultData | undefined>(cloneDeep(initialFaultData));
  const [isModeSelected, setIsModeSelected] = React.useState<boolean>(false);

  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const initialFaultTunables = React.useMemo(
    () => experimentHandler?.getFaultTunables(initialFaultData, faultTuneOperation),
    [experimentHandler, initialFaultData, faultTuneOperation]
  );

  const tuneExperimentRef = React.useRef<FormikProps<TuneExperimentForm>>();
  const [faultWeight, setFaultWeight] = React.useState<number>(faultData?.weight ?? 10);
  const [isAddProbeSelected, setIsAddProbeSelected] = React.useState<boolean>(false);

  const {
    isOpen: isOpenTuneConfirmDialog,
    open: openTuneConfirmDialog,
    close: closeTuneConfirmDialog
  } = useToggleOpen();

  const customButtonContainer = (
    <Container className={css.customButtons}>
      <Button
        text={getString('discard')}
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.MEDIUM}
        onClick={() => {
          onClose();
        }}
      />
      <Button
        text={getString('cancel')}
        variation={ButtonVariation.TERTIARY}
        size={ButtonSize.MEDIUM}
        onClick={closeTuneConfirmDialog}
      />
    </Container>
  );

  const [probe, setProbe] = React.useState<ChaosProbesSelectionProps>();

  const confirmationDialogProps = {
    usePortal: true,
    contentText: getString('closeTuneConfirmationDescription'),
    titleText: getString('closeTuneConfirmation'),
    confirmButtonText: getString('applyChanges'),
    customButtons: customButtonContainer,
    intent: Intent.WARNING,
    showCloseButton: false,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        applyChanges();
      }
      closeTuneConfirmDialog();
    },
    className: css.dialogWrapper
  };

  const confirmationDialog = <ConfirmationDialog isOpen={isOpenTuneConfirmDialog} {...confirmationDialogProps} />;

  const applyChanges = (): void => {
    // Submit the env tuning form
    tuneExperimentRef.current?.handleSubmit();
    // Check for errors in env tuning form
    if (!isEmpty(tuneExperimentRef.current?.errors)) {
      showError(getString('errorApplyChanges'));
      return;
    }
    // If there are no errors update experiment in IDB
    if (faultData) {
      experimentHandler?.updateExperimentManifestWithFaultData(experimentKey, faultData);
      experimentHandler?.updateFaultWeight(experimentKey, faultData.faultName, faultWeight);
    }
    onClose();
  };

  const header = (
    <Layout.Horizontal spacing={'small'} flex={{ distribution: 'space-between' }}>
      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
        <Icon name="chaos-scenario-builder" size={28} />
        <Text font={{ variation: FontVariation.H5 }}>{faultData?.faultName}</Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
        <Button
          variation={ButtonVariation.SECONDARY}
          minimal
          size={ButtonSize.SMALL}
          text={getString('applyChanges')}
          onClick={applyChanges}
        />
        <Button
          variation={ButtonVariation.TERTIARY}
          minimal
          size={ButtonSize.SMALL}
          text={getString('discard')}
          onClick={onClose}
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  );

  const showTargetApplicationTab =
    infraID && faultData?.engineCR?.spec?.appinfo && infrastructureType === InfrastructureType.KUBERNETES;

  const tabList = [
    {
      id: TuneFaultTab.TargetApplication,
      title: getString('targetApplication'),
      hidden: !showTargetApplicationTab,

      panel: (
        <TargetApplicationTabController
          engineCR={faultData?.engineCR}
          infrastructureID={infraID}
          setFaultData={setFaultData}
        />
      )
    },
    {
      id: TuneFaultTab.TuneFault,
      title: getString('tuneFault'),
      panel: (
        <FaultTunablesTab
          formRef={tuneExperimentRef}
          faultData={faultData}
          setFaultData={setFaultData}
          initialFaultTunables={initialFaultTunables}
          setFaultWeight={setFaultWeight}
        />
      )
    },
    {
      id: TuneFaultTab.Probes,
      title: getString('probes'),
      panel: (
        <NewProbes
          faultData={faultData}
          onSave={data => setFaultData({ ...faultData, ...data })}
          setIsAddProbeSelected={setIsAddProbeSelected}
        />
      )
    }
  ];

  return (
    <>
      <Drawer
        isOpen={isOpen}
        leftPanel={
          <div className={css.tabs}>
            <Tabs
              id={'tuneFaultTabs'}
              defaultSelectedTabId={showTargetApplicationTab ? TuneFaultTab.TargetApplication : TuneFaultTab.TuneFault}
              renderAllTabPanels
              tabList={tabList}
            />
          </div>
        }
        handleClose={() => {
          if (
            !isEqual(initialFaultData, faultData) ||
            faultWeight !== faultData?.weight ||
            tuneExperimentRef.current?.dirty
          ) {
            openTuneConfirmDialog();
            return;
          }
          onClose();
        }}
        title={header}
        type={DrawerTypes.TuneFault}
      />

      <Drawer
        isOpen={isAddProbeSelected}
        leftPanel={<SelectProbesTabController setProbe={setProbe} />}
        rightPanel={
          <SelectProbesDetailController
            probe={probe}
            setIsAddProbeSelected={setIsAddProbeSelected}
            setIsModeSelected={setIsModeSelected}
            isModeSelected={isModeSelected}
          />
        }
        handleClose={() => {
          setIsAddProbeSelected(false);
        }}
        title={<Text font={{ variation: FontVariation.H5 }}>{getString('selectAProbe')}</Text>}
        type={DrawerTypes.AddProbe}
      />

      <Drawer
        isOpen={isModeSelected}
        leftPanel={
          <SelectProbeModeView
            probe={probe}
            setIsModeSelected={setIsModeSelected}
            faultData={faultData}
            isModeSelected={isModeSelected}
            onSave={data => setFaultData({ ...faultData, ...data })}
          />
        }
        handleClose={() => {
          setIsModeSelected(false);
        }}
        title={<Text font={{ variation: FontVariation.H5 }}>{'Select a mode'}</Text>}
        type={DrawerTypes.SelectMode}
      />
      {confirmationDialog}
    </>
  );
}
