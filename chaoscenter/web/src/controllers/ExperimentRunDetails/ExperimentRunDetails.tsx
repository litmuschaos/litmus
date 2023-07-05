import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ListExperimentRunRequest, ListExperimentRunResponse, listExperimentRunWithExecutionData } from '@api/core';
import type { ExecutionData } from '@api/entities';
import { ExperimentRunStatus } from '@api/entities';
import { getScope } from '@utils';
import ExperimentRunDetailsView from '@views/ExperimentRunDetails';
import RightSideBarV2 from '@components/RightSideBarV2';
import type { GqlAPIQueryRequest } from '@api/types';

export default function ExperimentRunDetailsController(): React.ReactElement {
  const { experimentID, runID, notifyID } = useParams<{ experimentID: string; runID: string; notifyID: string }>();
  const scope = getScope();
  const { showError } = useToaster();

  const filter: Omit<GqlAPIQueryRequest<ListExperimentRunResponse, ListExperimentRunRequest>, 'Identifiers'> = runID
    ? { experimentRunIDs: [runID] }
    : { notifyIDs: [notifyID] };

  const {
    data: listExperimentRunData,
    loading: listExperimentRunLoading,
    exists: specificRunExists,
    startPolling,
    stopPolling
  } = listExperimentRunWithExecutionData({
    ...scope,
    ...filter,
    options: { onError: error => showError(error.message) }
  });

  const specificRunData = listExperimentRunData?.listExperimentRun?.experimentRuns[0];

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
      phase={specificRunData?.phase}
      // infrastructureType={specificRunData?.infra.infraType}
      experimentType={specificRunData?.experimentType}
    />
  );

  return (
    <ExperimentRunDetailsView
      experimentID={experimentID}
      experimentRunID={specificRunData?.experimentRunID ?? runID}
      runExists={specificRunExists}
      infraID={specificRunData?.infra.infraID}
      infrastructureName={specificRunData?.infra.name}
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
