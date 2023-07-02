import React from 'react';
import { Button, ButtonVariation, Dialog, StepWizard } from '@harness/uicore';
import { Icon } from '@harness/icons';
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
}

export const ProbeStepWizard = ({
  hideDarkModal,
  setProbeData,
  faultData
}: {
  hideDarkModal: () => void;
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>;
  faultData: FaultData | undefined;
}): JSX.Element => {
  const { getString } = useStrings();
  // const [stepNumber, setStepNumber] = React.useState<number>(1);
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
      initialDelaySeconds: undefined,
      stopOnFailure: undefined
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

  // const referenceId = (step: number, probeType: ProbeAttributes['type']): string => {
  //   if (step === 1) return 'chaosProbe';
  //   else {
  //     if (probeType === 'httpProbe') return 'chaosHttpProbe';
  //     else if (probeType === 'k8sProbe') return 'chaosK8sProbe';
  //     else if (probeType === 'cmdProbe') return 'chaosCmdProbe';
  //     else if (probeType === 'promProbe') return 'chaosPromProbe';
  //     else return 'chaosProbe';
  //   }
  // };
  return (
    <>
      <StepWizard
        icon={<Icon size={50} name="change-log" />}
        title={getString('addProbe')}
        className={css.stepWizardWrapper}
        // onStepChange={data => setStepNumber(data.prevStep + 1)}
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
        <ProbeDetailsStep name={getString('probeDetails')} formData={formData} setFormData={setFormData} />
      </StepWizard>
    </>
  );
};

const AddProbeModal = ({
  setProbeData,
  faultData
}: {
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>;
  faultData: FaultData | undefined;
}): JSX.Element => {
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
          setProbeData={setProbeData}
          hideDarkModal={() => setIsAddProbeModalOpen(false)}
          faultData={faultData}
        />
      </Dialog>
    </>
  );
};

export const AddProbeStepWizard = ({
  setProbeData,
  faultData
}: {
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>;
  faultData: FaultData | undefined;
}): JSX.Element => {
  return <AddProbeModal setProbeData={setProbeData} faultData={faultData} />;
};
