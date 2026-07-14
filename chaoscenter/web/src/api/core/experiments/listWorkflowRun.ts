import { gql, useQuery } from '@apollo/client';
import type { Pagination, SortInput, ExperimentRun, ExperimentRunFilterRequest } from '../../entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '../../types';

// Request for listExperimentRun Query
export interface ListExperimentRunRequest {
  projectID: string;
  request: {
    experimentRunIDs?: string[];
    experimentIDs?: string[];
    pagination?: Pagination;
    sort?: SortInput;
    filter?: ExperimentRunFilterRequest;
  };
}

// Response for listExperimentRun Query
export interface ListExperimentRunResponse {
  listExperimentRun: {
    totalNoOfExperimentRuns: number;
    experimentRuns: ExperimentRun[];
  };
}

// Request for getExperimentEvents Subscription
export interface GetExperimentEventsRequest {
  projectID: string;
  token: string;
}

// Response for getExperimentEvents Subscription
export interface GetExperimentEventsResponse {
  getExperimentEvents: ExperimentRun;
}

// <!-- used for listing runs for run history page-->
export function listExperimentRunForHistory({
  // String
  projectID,
  // Params
  experimentIDs,
  experimentRunIDs,
  pagination,
  sort,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListExperimentRunResponse, ListExperimentRunRequest>): GqlAPIQueryResponse<
  ListExperimentRunResponse,
  ListExperimentRunRequest
> {
  const { data, loading, ...rest } = useQuery<ListExperimentRunResponse, ListExperimentRunRequest>(
    gql`
      query listExperimentRun($projectID: ID!, $request: ListExperimentRunRequest!) {
        listExperimentRun(projectID: $projectID, request: $request) {
          totalNoOfExperimentRuns
          experimentRuns {
            experimentID
            experimentName
            experimentRunID
            experimentType
            updatedBy {
              username
            }
            experimentManifest
            updatedAt
            resiliencyScore
            phase
            weightages {
              faultName
              weightage
            }
            executionData
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        request: {
          experimentIDs,
          experimentRunIDs,
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
    exists: data ? Boolean(data.listExperimentRun.totalNoOfExperimentRuns) : undefined,
    ...rest
  };
}

export function listExperimentRunWithExecutionData({
  // String
  projectID,
  // Params
  experimentIDs,
  experimentRunIDs,
  pagination,
  sort,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListExperimentRunResponse, ListExperimentRunRequest>): GqlAPIQueryResponse<
  ListExperimentRunResponse,
  ListExperimentRunRequest
> {
  const { data, loading, ...rest } = useQuery<ListExperimentRunResponse, ListExperimentRunRequest>(
    gql`
      query listExperimentRun($projectID: ID!, $request: ListExperimentRunRequest!) {
        listExperimentRun(projectID: $projectID, request: $request) {
          totalNoOfExperimentRuns
          experimentRuns {
            experimentRunID
            experimentID
            updatedAt
            infra {
              infraID
              name
              infraNamespace
              infraScope
              infraType
            }
            experimentName
            experimentType
            experimentManifest
            phase
            resiliencyScore
            faultsPassed
            faultsFailed
            faultsAwaited
            faultsStopped
            faultsNa
            totalFaults
            isRemoved
            updatedBy {
              username
            }
            weightages {
              faultName
              weightage
            }
            executionData
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        request: {
          experimentIDs,
          experimentRunIDs,
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
    exists: data ? Boolean(data.listExperimentRun.totalNoOfExperimentRuns) : undefined,
    ...rest
  };
}
