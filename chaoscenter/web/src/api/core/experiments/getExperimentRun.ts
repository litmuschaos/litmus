import { useQuery, gql } from '@apollo/client';
import type { ExperimentRun } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetExperimentRunRequest {
  projectID: string;
  experimentRunID?: string;
  notifyID?: string;
}

export interface GetExperimentRunResponse {
  getExperimentRun: ExperimentRun;
}

export function getExperimentRun({
  // Identifiers
  projectID,
  // Experiment Run ID,
  experimentRunID,
  notifyID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentRunResponse, GetExperimentRunRequest>): GqlAPIQueryResponse<
  GetExperimentRunResponse,
  GetExperimentRunRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentRunResponse, GetExperimentRunRequest>(
    gql`
      query getExperimentRun($projectID: ID!, $experimentRunID: ID, $notifyID: ID) {
        getExperimentRun(projectID: $projectID, experimentRunID: $experimentRunID, notifyID: $notifyID) {
          experimentRunID
          runSequence
          notifyID
          experimentID
          updatedAt
          infra {
            environmentID
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
          updatedBy {
            username
          }
          weightages {
            faultName
            weightage
          }
          executionData
          # errorResponse
        }
      }
    `,
    {
      variables: {
        projectID,
        experimentRunID,
        notifyID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    exists: data ? Boolean(data.getExperimentRun) : undefined,
    ...rest
  };
}

export function getExperimentRunManifest({
  // Identifiers
  projectID,
  // Experiment Run ID,
  experimentRunID,
  notifyID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentRunResponse, GetExperimentRunRequest>): GqlAPIQueryResponse<
  GetExperimentRunResponse,
  GetExperimentRunRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentRunResponse, GetExperimentRunRequest>(
    gql`
      query getExperimentRun($projectID: ID!, $experimentRunID: String, $notifyID: String) {
        getExperimentRun(projectID: $projectID, experimentRunID: $experimentRunID, notifyID: $notifyID) {
          experimentID
          experimentRunID
          notifyID
          experimentName
          experimentManifest
        }
      }
    `,
    {
      variables: {
        projectID,
        experimentRunID,
        notifyID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    exists: data ? Boolean(data.getExperimentRun) : undefined,
    ...rest
  };
}
