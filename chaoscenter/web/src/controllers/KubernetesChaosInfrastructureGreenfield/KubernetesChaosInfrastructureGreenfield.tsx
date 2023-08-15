import React from 'react';
import type { StepData } from '@views/KubernetesChaosInfrastructureCreationModal/KubernetesChaosInfrastructureStepWizardConfiguration';
import KubernetesChaosInfrastructureGreenfieldView from '@views/KubernetesChaosInfrastructureGreenfield';
import { connectChaosInfraManifestMode } from '@api/core/infrastructures/connectChaosInfra';

interface KubernetesChaosInfrastructureGreenfieldControllerProps {
  data: StepData;
  infraRegistered: boolean;
  setInfraRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function KubernetesChaosInfrastructureGreenfieldController({
  data,
  infraRegistered,
  setInfraRegistered
}: KubernetesChaosInfrastructureGreenfieldControllerProps): React.ReactElement {
  const [connectChaosInfrastructureMutation] = connectChaosInfraManifestMode({});
  return (
    <KubernetesChaosInfrastructureGreenfieldView
      connectChaosInfrastructureMutation={connectChaosInfrastructureMutation}
      data={data}
      infraRegistered={infraRegistered}
      setInfraRegistered={setInfraRegistered}
    />
  );
}
