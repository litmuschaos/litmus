import { gql, useQuery } from '@apollo/client';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';
import type { Environment } from '@api/entities';

export interface GetEnvironmentRequest {
  projectID: string;
  environmentID: string;
}

export interface GetEnvironmentResponse {
  getEnvironment: Environment;
}

export function getEnvironment({
  projectID,
  environmentID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetEnvironmentResponse, GetEnvironmentRequest>): GqlAPIQueryResponse<
  GetEnvironmentResponse,
  GetEnvironmentRequest
> {
  const { data, loading, ...rest } = useQuery<GetEnvironmentResponse, GetEnvironmentRequest>(
    gql`
      query getEnvironment($projectID: ID!, $environmentID: ID!) {
        getEnvironment(environmentID: $environmentID, projectID: $projectID) {
          environmentID
          name
          description
          tags
          projectID
          type
          createdAt
          createdBy {
            username
          }
          updatedAt
          updatedBy {
            username
          }
          isRemoved
          infraIDs
        }
      }
    `,
    {
      variables: {
        projectID: projectID,
        environmentID: environmentID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    exists: data ? Boolean(data.getEnvironment) : undefined,
    ...rest
  };
}
