import { gql, useQuery } from '@apollo/client';
import type { InfraStatsData } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetInfraStatsRequest {
  projectID: string;
}

export interface GetInfraStatsResponse {
  getInfraStats: InfraStatsData;
}

export function getInfraStats({
  projectID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetInfraStatsResponse, GetInfraStatsRequest>): GqlAPIQueryResponse<
  GetInfraStatsResponse,
  GetInfraStatsRequest
> {
  const { data, loading, ...rest } = useQuery<GetInfraStatsResponse, GetInfraStatsRequest>(
    gql`
      query getInfraStats($projectID: ID!) {
        getInfraStats(projectID: $projectID) {
          totalInfrastructures
          totalActiveInfrastructure
          totalInactiveInfrastructures
          totalConfirmedInfrastructure
          totalNonConfirmedInfrastructures
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
