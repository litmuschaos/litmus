import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getScope } from '@utils';
import { minimalListProbes } from '@api/core';
import SelectProbesTabView from '@views/ExperimentCreationFaultConfiguration/Tabs/Probes/SelectProbesTab';
import { useSearchParams } from '@hooks';
import type { InfrastructureType } from '@api/entities';
import type { ChaosProbesSelectionProps, ChaosProbesSelectionTableProps } from './types';
import { generateChaosProbesSelectionDashboardTableContent } from './helpers';

export default function SelectProbesTabController({
  setProbe
}: {
  setProbe: React.Dispatch<React.SetStateAction<ChaosProbesSelectionProps | undefined>>;
}): React.ReactElement {
  const scope = getScope();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  const { showError } = useToaster();

  const { data, loading, refetch } = minimalListProbes({
    ...scope,
    infrastructureType: infrastructureType,
    options: {
      onError: err => showError(err.message)
    }
  });

  const chaosProbesSelectionTableData: ChaosProbesSelectionTableProps | undefined = data?.listProbes && {
    content: generateChaosProbesSelectionDashboardTableContent(data.listProbes)
  };

  return (
    <SelectProbesTabView
      probesTableData={chaosProbesSelectionTableData}
      loading={loading}
      setProbe={setProbe}
      refetch={refetch}
    />
  );
}
