import { gql, useQuery } from '@apollo/client';
import type { ExperimentStatsData } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetExperimentStatsRequest {
  projectID: string;
}

export interface GetExperimentStatsResponse {
  getExperimentStats: ExperimentStatsData;
}

export function getExperimentStats({
  projectID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentStatsResponse, GetExperimentStatsRequest>): GqlAPIQueryResponse<
  GetExperimentStatsResponse,
  GetExperimentStatsRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentStatsResponse, GetExperimentStatsRequest>(
    gql`
      query getExperimentStats($projectID: ID!) {
        getExperimentStats(projectID: $projectID) {
          totalExperiments
          totalExpCategorizedByResiliencyScore {
            count
            id
          }
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
