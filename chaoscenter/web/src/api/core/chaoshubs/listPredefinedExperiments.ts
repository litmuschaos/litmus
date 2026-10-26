import { gql, useLazyQuery, useQuery } from '@apollo/client';
import type { PredefinedExperiment } from '@api/entities';
import type { GqlAPIQueryResponse, GqlAPIQueryRequest, GqlAPILazyQueryResponse } from '@api/types';

export interface ListPredefinedExperimentRequest {
  projectID: string;
  hubID: string;
}

export interface ListPredefinedExperimentResponse {
  listPredefinedExperiments: Array<PredefinedExperiment>;
}

export function listPredefinedExperiment({
  projectID,
  // Params
  hubID,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  ListPredefinedExperimentResponse,
  ListPredefinedExperimentRequest,
  Omit<ListPredefinedExperimentRequest, 'projectID'>
>): GqlAPIQueryResponse<ListPredefinedExperimentResponse, ListPredefinedExperimentRequest> {
  const { data, loading, ...rest } = useQuery<ListPredefinedExperimentResponse, ListPredefinedExperimentRequest>(
    gql`
      query listPredefinedExperiments($projectID: ID!, $hubID: ID!) {
        listPredefinedExperiments(projectID: $projectID, hubID: $hubID) {
          experimentName
          experimentCSV
          experimentManifest
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

export interface GetPredefinedExperimentRequest {
  projectID: string;
  hubID: string;
  experiments: Array<string>;
}

export interface GetPredefinedExperimentResponse {
  getPredefinedExperiment: Array<PredefinedExperiment>;
}

export function getPredefinedExperiment({
  projectID,
  // Params
  hubID,
  experiments,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetPredefinedExperimentResponse, GetPredefinedExperimentRequest>): GqlAPILazyQueryResponse<
  GetPredefinedExperimentResponse,
  GetPredefinedExperimentRequest
> {
  const [getPredefinedExperimentQuery, result] = useLazyQuery<
    GetPredefinedExperimentResponse,
    GetPredefinedExperimentRequest
  >(
    gql`
      query getPredefinedExperiment($projectID: ID!, $hubID: ID!, $experiments: [String!]!) {
        getPredefinedExperiment(projectID: $projectID, hubID: $hubID, experimentName: $experiments) {
          experimentName
          experimentCSV
          experimentManifest
        }
      }
    `,
    {
      variables: {
        projectID,
        hubID,
        experiments
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getPredefinedExperimentQuery, result];
}
