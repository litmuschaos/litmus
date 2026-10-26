import { gql, useQuery } from '@apollo/client';
import type { Pagination, ExperimentFilterRequest, SortInput, Experiment } from '../../entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '../../types';

// Request for listExperimentRun Query
export interface ListExperimentRequest {
  projectID: string;
  request: {
    experimentIDs?: Array<string>;
    pagination?: Pagination;
    sort?: SortInput;
    filter?: ExperimentFilterRequest;
  };
}

// Response for listExperimentRun Query
export interface ListExperimentResponse {
  listExperiment: {
    totalNoOfExperiments: number;
    experiments: Array<Experiment>;
  };
}

export function listExperiment({
  // String
  projectID,
  // Params
  experimentIDs,
  pagination,
  sort,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListExperimentResponse, ListExperimentRequest>): GqlAPIQueryResponse<
  ListExperimentResponse,
  ListExperimentRequest
> {
  const { data, loading, ...rest } = useQuery<ListExperimentResponse, ListExperimentRequest>(
    gql`
      query listExperiment($projectID: ID!, $request: ListExperimentRequest!) {
        listExperiment(projectID: $projectID, request: $request) {
          totalNoOfExperiments
          experiments {
            experimentID
            cronSyntax
            infra {
              infraID
              infraType
              name
              environmentID
              infraNamespace
              infraScope
              isActive
            }
            experimentType
            experimentManifest
            name
            description
            tags
            createdAt
            createdBy {
              username
            }
            updatedAt
            updatedBy {
              username
            }
            recentExperimentRunDetails {
              experimentRunID
              phase
              resiliencyScore
              updatedAt
              updatedBy {
                username
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        projectID: projectID,
        request: {
          experimentIDs,
          pagination,
          sort,
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
    exists: data ? Boolean(data.listExperiment.totalNoOfExperiments) : undefined,
    ...rest
  };
}

export function listExperimentMinimal({
  // String
  projectID,
  // Params
  experimentIDs,
  pagination,
  sort,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListExperimentResponse, ListExperimentRequest>): GqlAPIQueryResponse<
  ListExperimentResponse,
  ListExperimentRequest
> {
  const { data, loading, ...rest } = useQuery<ListExperimentResponse, ListExperimentRequest>(
    gql`
      query listExperiment($projectID: ID!, $request: ListExperimentRequest!) {
        listExperiment(projectID: $projectID, request: $request) {
          totalNoOfExperiments
          experiments {
            experimentID
            name
            description
            tags
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        request: {
          experimentIDs,
          pagination,
          sort,
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
    exists: data ? Boolean(data.listExperiment.totalNoOfExperiments) : undefined,
    ...rest
  };
}
