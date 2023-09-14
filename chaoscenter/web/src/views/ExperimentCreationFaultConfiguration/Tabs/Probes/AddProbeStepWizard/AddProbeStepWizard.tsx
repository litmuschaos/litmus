import React from 'react';
import { Button, ButtonVariation, Dialog, StepWizard } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import type { FaultData, ProbeAttributes } from '@models';
import { useStrings } from '@strings';
import { ProbeOverviewStep } from './ProbeOverviewStep';
import { ProbePropertiesStep } from './ProbePropertiesStep';
import { ProbeDetailsStep } from './ProbeDetailsStep';
import css from '../Probes.module.scss';

export interface StepData {
  name?: string | JSX.Element;
}

export interface StepProps<PrevStepData> {
  name?: string | JSX.Element;
  formData: ProbeAttributes;
  setFormData: React.Dispatch<React.SetStateAction<ProbeAttributes>>;
  subTitle?: string | JSX.Element;
  prevStepData?: PrevStepData;
  currentStep?: () => number;
  totalSteps?: () => number;
  nextStep?: (data?: PrevStepData) => void;
  previousStep?: (data?: PrevStepData) => void;
  firstStep?: (data?: PrevStepData) => void;
  lastStep?: (data?: PrevStepData) => void;
  faultData?: FaultData | undefined;
  environmentID?: string;
}

export const ProbeStepWizard = ({
  environmentID,
  hideDarkModal,
  setProbeData,
  faultData
}: {
  environmentID: string;
  hideDarkModal: () => void;
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>;
  faultData: FaultData | undefined;
}): JSX.Element => {
  const { getString } = useStrings();
  const [formData, setFormData] = React.useState<ProbeAttributes>({
    name: `probe-${(+new Date()).toString(36).slice(-3)}`,
    type: '',
    mode: '',
    'k8sProbe/inputs': undefined,
    'httpProbe/inputs': undefined,
    'cmdProbe/inputs': undefined,
    'promProbe/inputs': undefined,
    runProperties: {
      probeTimeout: undefined,
      interval: undefined,
      retry: undefined,
      probePollingInterval: undefined,
      initialDelay: undefined,
      stopOnFailure: undefined,
      evaluationTimeout: undefined
    },
    data: undefined
  });
  React.useEffect(() => {
    if (
      formData['k8sProbe/inputs'] ||
      formData['httpProbe/inputs'] ||
      formData['cmdProbe/inputs'] ||
      formData['promProbe/inputs']
    ) {
      setProbeData(oldProbes => {
        if (oldProbes) return [...oldProbes, formData];
        else return [formData];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  return (
    <>
      <StepWizard
        icon={<Icon name="change-log" size={50} />}
        title={getString('addProbe')}
        className={css.stepWizardWrapper}
        onCompleteWizard={() => {
          hideDarkModal();
        }}
      >
        <ProbeOverviewStep
          name={getString('probeOverview')}
          formData={formData}
          setFormData={setFormData}
          faultData={faultData}
        />
        <ProbePropertiesStep name={getString('probeProperties')} formData={formData} setFormData={setFormData} />
        <ProbeDetailsStep
          environmentID={environmentID}
          name={getString('probeDetails')}
          formData={formData}
          setFormData={setFormData}
        />
      </StepWizard>
    </>
  );
};

export const AddProbeStepWizard = ({
  setProbeData,
  faultData,
  environmentID
}: {
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>;
  faultData: FaultData | undefined;
  environmentID: string;
}): React.ReactElement => {
  const { getString } = useStrings();
  const [isAddProbeModalOpen, setIsAddProbeModalOpen] = React.useState(false);

  return (
    <>
      <Button
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        text={getString('deployProbe')}
        onClick={() => {
          setIsAddProbeModalOpen(true);
        }}
      />
      <Dialog
        isOpen={isAddProbeModalOpen}
        enforceFocus={false}
        onClose={() => setIsAddProbeModalOpen(false)}
        className={css.modalStepWizard}
      >
        <ProbeStepWizard
          environmentID={environmentID}
          setProbeData={setProbeData}
          hideDarkModal={() => setIsAddProbeModalOpen(false)}
          faultData={faultData}
        />
      </Dialog>
    </>
  );
};
