import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getProbeAllProperties } from '@api/core';
import { getScope } from '@utils';
import ProbePropertiesView from '@views/ExperimentCreationFaultConfiguration/Tabs/Probes/SelectProbeMode/ProbeProperties';
import type { Mode } from '@api/entities';

interface ProbePropertiesControllerProps {
  probeName: string;
  mode: Mode;
  isModeSelected: boolean;
}

export default function ProbePropertiesController({
  probeName,
  mode,
  isModeSelected
}: ProbePropertiesControllerProps): React.ReactElement {
  const { showError } = useToaster();
  const scope = getScope();

  const { data, loading } = getProbeAllProperties({
    ...scope,
    probeName: probeName,
    options: {
      onError: err => showError(err.message)
    }
  });

  return (
    <ProbePropertiesView probeDetails={data?.getProbe} loading={loading} mode={mode} isModeSelected={isModeSelected} />
  );
}
