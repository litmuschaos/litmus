import { gql, useQuery } from '@apollo/client';
import type { GqlAPIQueryResponse, GqlAPIQueryRequest } from '@api/types';
import type { ProbeReference } from '@api/entities';

export interface GetProbeReferenceRequest {
  projectID: string;
  probeName: string;
}

export interface GetProbeReferenceResponse {
  getProbeReference: ProbeReference;
}

export function getProbeReference({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeReferenceResponse, GetProbeReferenceRequest>): GqlAPIQueryResponse<
  GetProbeReferenceResponse,
  GetProbeReferenceRequest
> {
  // Query to List workflows
  const { data, loading, ...rest } = useQuery<GetProbeReferenceResponse, GetProbeReferenceRequest>(
    gql`
      query GetProbeReference($probeName: ID!, $projectID: ID!) {
        getProbeReference(probeName: $probeName, projectID: $projectID) {
          name
          totalRuns
          recentExecutions {
            faultName
            mode
            executionHistory {
              executedByExperiment {
                experimentID
                experimentName
                updatedAt
                updatedBy {
                  username
                  email
                }
              }
              status {
                verdict
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    ...rest
  };
}
