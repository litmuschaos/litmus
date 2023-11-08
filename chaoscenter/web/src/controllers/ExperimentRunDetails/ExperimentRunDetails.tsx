import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { useParams } from 'react-router-dom';
import type { ExecutionData } from '@api/entities';
import { ExperimentRunStatus } from '@api/entities';
import { getScope } from '@utils';
import ExperimentRunDetailsView from '@views/ExperimentRunDetails';
import RightSideBarV2 from '@components/RightSideBarV2';
import { getExperimentRun } from '@api/core/experiments/getExperimentRun';

export default function ExperimentRunDetailsController(): React.ReactElement {
  const { experimentID, runID, notifyID } = useParams<{ experimentID: string; runID: string; notifyID: string }>();
  const scope = getScope();
  const { showError } = useToaster();

  const {
    data: listExperimentRunData,
    loading: listExperimentRunLoading,
    exists: specificRunExists,
    startPolling,
    stopPolling
  } = getExperimentRun({
    ...scope,
    experimentRunID: runID,
    notifyID,
    options: { onError: error => showError(error.message) }
  });

  const specificRunData = listExperimentRunData?.getExperimentRun;

  React.useEffect(() => {
    if (
      specificRunData?.phase === ExperimentRunStatus.RUNNING ||
      specificRunData?.phase === ExperimentRunStatus.QUEUED ||
      specificRunData?.phase === ExperimentRunStatus.NA
    ) {
      startPolling(3000);
    } else {
      stopPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificRunData]);

  const executionData =
    specificRunExists && specificRunData?.executionData.length
      ? (JSON.parse(specificRunData.executionData) as ExecutionData)
      : undefined;

  const rightSideBarV2 = (
    <RightSideBarV2
      experimentID={experimentID}
      experimentRunID={runID}
      notifyID={notifyID}
      phase={specificRunData?.phase}
      experimentType={specificRunData?.experimentType}
    />
  );

  return (
    <ExperimentRunDetailsView
      experimentID={experimentID}
      runSequence={specificRunData?.runSequence}
      experimentRunID={specificRunData?.experimentRunID ?? runID}
      runExists={specificRunExists}
      infra={specificRunData?.infra}
      experimentName={specificRunData?.experimentName}
      experimentExecutionDetails={executionData}
      manifest={specificRunData?.experimentManifest}
      phase={specificRunData?.phase as ExperimentRunStatus}
      resiliencyScore={specificRunData?.resiliencyScore}
      rightSideBar={rightSideBarV2}
      loading={{
        listExperimentRun: listExperimentRunLoading
      }}
    />
  );
}
