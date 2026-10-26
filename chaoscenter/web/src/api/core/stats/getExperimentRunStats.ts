import { gql, useQuery } from '@apollo/client';
import type { ExperimentRunStatsData } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetExperimentRunStatsRequest {
  projectID: string;
}

export interface GetExperimentRunStatsResponse {
  getExperimentRunStats: ExperimentRunStatsData;
}

export function getExperimentRunStats({
  projectID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentRunStatsResponse, GetExperimentRunStatsRequest>): GqlAPIQueryResponse<
  GetExperimentRunStatsResponse,
  GetExperimentRunStatsRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentRunStatsResponse, GetExperimentRunStatsRequest>(
    gql`
      query getExperimentRunStats($projectID: ID!) {
        getExperimentRunStats(projectID: $projectID) {
          totalExperimentRuns
          totalRunningExperimentRuns
          totalCompletedExperimentRuns
          totalTerminatedExperimentRuns
          totalStoppedExperimentRuns
          totalErroredExperimentRuns
        }
      }
    `,
    {
      variables: {
        projectID
      },
      ...options
    }
  );

  return {
    data,
    loading: loading,
    ...rest
  };
}
