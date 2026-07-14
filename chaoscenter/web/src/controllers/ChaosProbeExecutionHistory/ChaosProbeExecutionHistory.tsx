import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import { getScope } from '@utils';
import ChaosProbeExecutionHistoryView from '@views/ChaosProbeExecutionHistory';
import { getProbeReference } from '@api/core';
import type { ChaosProbesExecutionHistoryTableProps } from './types';
import { generateChaosProbesExecutionHistoryTableContent } from './helpers';

export default function ChaosProbeExecutionHistoryController(): React.ReactElement {
  const scope = getScope();
  const { probeName } = useParams<{ probeName: string }>();
  const { showError } = useToaster();

  const { data, loading, refetch } = getProbeReference({
    ...scope,
    probeName: probeName,
    options: {
      onError: err => showError(err.message),
      nextFetchPolicy: 'cache-first',
      pollInterval: 10000
    }
  });

  const probeData = data?.getProbeReference;

  const chaosProbesExecutionHistoryTableData: ChaosProbesExecutionHistoryTableProps | undefined = probeData && {
    content: generateChaosProbesExecutionHistoryTableContent(probeData)
  };

  return (
    <ChaosProbeExecutionHistoryView
      executionTableData={chaosProbesExecutionHistoryTableData}
      refetchProbeReference={refetch}
      loading={loading}
    />
  );
}
