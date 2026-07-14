import { gql, useQuery } from '@apollo/client';
import type { ChaosHubStatsData } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetChaosHubStatsRequest {
  projectID: string;
}

export interface GetChaosHubStatsResponse {
  getChaosHubStats: ChaosHubStatsData;
}

export function getChaosHubStats({
  // Identifiers
  projectID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetChaosHubStatsResponse, GetChaosHubStatsRequest>): GqlAPIQueryResponse<
  GetChaosHubStatsResponse,
  GetChaosHubStatsRequest
> {
  const { data, loading, ...rest } = useQuery<GetChaosHubStatsResponse, GetChaosHubStatsRequest>(
    gql`
      query getChaosHubStats($projectID: ID!) {
        getChaosHubStats(projectID: $projectID) {
          totalChaosHubs
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
