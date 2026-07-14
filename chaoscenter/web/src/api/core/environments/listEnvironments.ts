import { gql, useQuery } from '@apollo/client';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';
import type { Environment, EnvironmentFilterInput, EnvironmentSortInput, Pagination } from '@api/entities';

export interface ListEnvironmentProps {
  environmentIDs: Array<string>;
  pagination?: Pagination;
  filter: EnvironmentFilterInput;
  sort: EnvironmentSortInput;
}

export interface ListEnvironmentRequest {
  projectID: string;
  request: ListEnvironmentProps;
}

export interface ListEnvironmentResponse {
  listEnvironments: {
    totalNoOfEnvironments: number;
    environments: Array<Environment>;
  };
}

export function listEnvironment({
  projectID,
  environmentIDs,
  pagination,
  filter,
  sort,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListEnvironmentResponse, ListEnvironmentRequest>): GqlAPIQueryResponse<
  ListEnvironmentResponse,
  ListEnvironmentRequest
> {
  const { data, loading, ...rest } = useQuery<ListEnvironmentResponse, ListEnvironmentRequest>(
    gql`
      query listEnvironments($projectID: ID!, $request: ListEnvironmentRequest!) {
        listEnvironments(request: $request, projectID: $projectID) {
          environments {
            environmentID
            name
            description
            updatedBy {
              email
              username
            }
            updatedAt
            createdAt
            createdBy {
              email
              username
            }
            tags
            type
            infraIDs
            isRemoved
          }
          totalNoOfEnvironments
        }
      }
    `,
    {
      variables: {
        projectID: projectID,
        request: {
          environmentIDs,
          pagination,
          filter,
          sort
        }
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    exists: data ? Boolean(data.listEnvironments) : undefined,
    ...rest
  };
}
