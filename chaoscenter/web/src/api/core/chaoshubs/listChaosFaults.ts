import { gql, useQuery, useLazyQuery } from '@apollo/client';
import type { Chart } from '@api/entities';
import type {
  GqlAPIQueryResponse,
  GqlAPIQueryRequest,
  GqlAPILazyQueryRequest,
  GqlAPILazyQueryResponse
} from '@api/types';

export interface ListFaultsRequest {
  projectID: string;
  hubID: string;
}

export interface ListFaultResponse {
  listChaosFaults: Array<Chart>;
}

export function listChaosFaults({
  projectID,
  // Params
  hubID,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListFaultResponse, ListFaultsRequest, Omit<ListFaultsRequest, 'projectID'>>): GqlAPIQueryResponse<
  ListFaultResponse,
  ListFaultsRequest
> {
  const { data, loading, ...rest } = useQuery<ListFaultResponse, ListFaultsRequest>(
    gql`
      query listChaosFaults($hubID: ID!, $projectID: ID!) {
        listChaosFaults(hubID: $hubID, projectID: $projectID) {
          metadata {
            name
          }
          spec {
            displayName
            faults {
              name
              displayName
              description
            }
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        hubID
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

export function listChaosFaultsLazyQuery({
  ...options
}: GqlAPILazyQueryRequest<ListFaultResponse, ListFaultsRequest>): GqlAPILazyQueryResponse<
  ListFaultResponse,
  ListFaultsRequest
> {
  const [listChaosFaultsQuery, result] = useLazyQuery<ListFaultResponse, ListFaultsRequest>(
    gql`
      query listChaosFaults($hubID: ID!, $projectID: ID!) {
        listChaosFaults(hubID: $hubID, projectID: $projectID) {
          metadata {
            name
          }
          spec {
            displayName
            faults {
              name
              displayName
              description
            }
          }
        }
      }
    `,
    {
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [listChaosFaultsQuery, result];
}
