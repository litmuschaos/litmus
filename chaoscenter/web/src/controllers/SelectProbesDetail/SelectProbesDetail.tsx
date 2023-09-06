import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getLazyProbe } from '@api/core';
import SelectProbesDetailView from '@views/ExperimentCreationFaultConfiguration/Tabs/Probes/SelectProbesDetail';
import type { ChaosProbesSelectionProps } from '@controllers/SelectProbesTab/types';

export interface SelectProbesDetailControllerProps {
  setIsAddProbeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  probe: ChaosProbesSelectionProps | undefined;
  isModeSelected: boolean;
}

export default function SelectProbesDetailController({
  setIsAddProbeSelected,
  setIsModeSelected,
  isModeSelected,
  probe
}: SelectProbesDetailControllerProps): React.ReactElement {
  const { showError } = useToaster();

  const [getLazyProbeQuery, { loading }] = getLazyProbe({
    onError: err => showError(err.message)
  });

  return (
    <SelectProbesDetailView
      probe={probe}
      loading={loading}
      setIsAddProbeSelected={setIsAddProbeSelected}
      setIsModeSelected={setIsModeSelected}
      getLazyProbeQuery={getLazyProbeQuery}
      isModeSelected={isModeSelected}
    />
  );
}
