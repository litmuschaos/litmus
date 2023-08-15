import { SimpleLogViewer } from '@harnessio/uicore';
import React from 'react';
import { getPodLogsSubscription } from '@api/core';
import { ChaosData, ExperimentRunStatus } from '@api/entities';
import { getScope } from '@utils';
import { useStrings } from '@strings';

interface CustomStepLogControllerProps {
  nodeType: string | undefined;
  chaosData: ChaosData | undefined;
  namespace: string | undefined;
  workflowRunID: string | undefined;
  infraID: string | undefined;
  podName: string;
  requestID: string;
  phase: ExperimentRunStatus | undefined;
}

export default function CustomStepLogController({
  workflowRunID,
  infraID,
  podName,
  chaosData,
  nodeType,
  namespace,
  phase
}: CustomStepLogControllerProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const {
    data: podLogs,
    loading,
    error
  } = getPodLogsSubscription({
    request: {
      ...scope,
      infraID: infraID ?? '',
      // requestID: requestID,
      experimentRunID: workflowRunID,
      podName: podName,
      podNamespace: namespace ?? '',
      podType: nodeType ?? '',
      expPod: chaosData?.faultPod,
      runnerPod: chaosData?.runnerPod,
      chaosNamespace: chaosData?.namespace
    }
  });

  React.useEffect(() => {
    if (
      phase === ExperimentRunStatus.RUNNING ||
      phase === ExperimentRunStatus.QUEUED ||
      phase === ExperimentRunStatus.NA
    ) {
      // startPolling(5000);
    } else {
      // stopPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <SimpleLogViewer
      loading={loading}
      data={
        podLogs && podLogs?.getPodLog ? podLogs.getPodLog.log : error ? error.message : getString('logErrorMessage')
      }
    />
  );
}
