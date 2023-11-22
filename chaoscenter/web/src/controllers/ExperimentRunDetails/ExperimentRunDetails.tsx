import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ExecutionData, ExperimentType, ExperimentRunStatus } from '@api/entities';
import { cronEnabled, getScope } from '@utils';
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

  const parsedManifest =
    specificRunData && specificRunData?.experimentManifest ? JSON.parse(specificRunData.experimentManifest) : undefined;
  const isCronEnabled =
    specificRunExists && specificRunData?.experimentType === ExperimentType.CRON && cronEnabled(parsedManifest);

  const rightSideBarV2 = (
    <RightSideBarV2
      experimentID={experimentID}
      experimentRunID={runID}
      notifyID={notifyID}
      isCronEnabled={isCronEnabled}
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
