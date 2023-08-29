import { gql, useQuery } from '@apollo/client';
import type { ChaosHub, ChaosHubFilterInput } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface ListChaosHubRequest {
  projectID: string;
  request: {
    chaosHubIDs?: Array<string>;
    filter?: ChaosHubFilterInput;
  };
}

export interface ListChaosHubResponse {
  listChaosHub?: Array<ChaosHub>;
}

// TODO: Update this API to latest API structure with options
export function listChaosHub({
  projectID,
  // Params
  chaosHubIDs,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListChaosHubResponse, ListChaosHubRequest, ListChaosHubRequest['request']>): GqlAPIQueryResponse<
  ListChaosHubResponse,
  ListChaosHubRequest
> {
  // Query to List chaosHub
  const { data, loading, ...rest } = useQuery<ListChaosHubResponse, ListChaosHubRequest>(
    gql`
      query listChaosHub($projectID: ID!, $request: ListChaosHubRequest!) {
        listChaosHub(projectID: $projectID, request: $request) {
          id
          repoURL
          repoBranch
          authType
          isAvailable
          totalFaults
          totalExperiments
          name
          token
          sshPublicKey
          sshPrivateKey
          authType
          lastSyncedAt
          tags
          isDefault
          isPrivate
          createdBy {
            username
          }
          updatedBy {
            username
          }
          createdAt
          updatedAt
          description
        }
      }
    `,
    {
      variables: {
        projectID,
        request: {
          chaosHubIDs,
          filter
        }
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
