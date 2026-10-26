import { gql, useLazyQuery, useQuery } from '@apollo/client';
import type { Experiment } from '@api/entities';
import type {
  GqlAPILazyQueryRequest,
  GqlAPILazyQueryResponse,
  GqlAPIQueryRequest,
  GqlAPIQueryResponse
} from '../../types';

// Request for getExperiment Query
export interface GetExperimentRequest {
  projectID: string;
  experimentID: string;
}

// Response for getExperiment Query
export interface GetExperimentResponse {
  getExperiment: {
    experimentDetails: Experiment;
    averageResiliencyScore?: number;
  };
}

export function getExperiment({
  // projectID
  projectID,
  // Params
  experimentID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentResponse, GetExperimentRequest>): GqlAPIQueryResponse<
  GetExperimentResponse,
  GetExperimentRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentResponse, GetExperimentRequest>(
    gql`
      query getExperiment($projectID: ID!, $experimentID: String!) {
        getExperiment(projectID: $projectID, experimentID: $experimentID) {
          experimentDetails {
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
              isInfraConfirmed
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
            recentexperimentRunDetails {
              experimentRunID
              notifyID
              phase
              resiliencyScore
              updatedAt
              updatedBy {
                username
              }
            }
            eventsMetadata {
              faultName
              serviceIdentifier
              environmentIdentifier
            }
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        experimentID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading,
    exists: data ? Boolean(data.getExperiment) : undefined,
    ...rest
  };
}

export function getExperimentMinimal({
  // projectID
  projectID,
  // Params
  experimentID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentResponse, GetExperimentRequest>): GqlAPIQueryResponse<
  GetExperimentResponse,
  GetExperimentRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentResponse, GetExperimentRequest>(
    gql`
      query getExperiment($projectID: ID!, $experimentID: String!) {
        getExperiment(projectID: $projectID, experimentID: $experimentID) {
          experimentDetails {
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
        experimentID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading,
    exists: data ? Boolean(data.getExperiment) : undefined,
    ...rest
  };
}

export function getExperimentManifest({
  // projectID
  projectID,
  // Params
  experimentID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetExperimentResponse, GetExperimentRequest>): GqlAPIQueryResponse<
  GetExperimentResponse,
  GetExperimentRequest
> {
  const { data, loading, ...rest } = useQuery<GetExperimentResponse, GetExperimentRequest>(
    gql`
      query getExperiment($projectID: ID!, $experimentID: String!) {
        getExperiment(projectID: $projectID, experimentID: $experimentID) {
          experimentDetails {
            experimentID
            name
            description
            tags
            experimentManifest
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        experimentID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading,
    exists: data ? Boolean(data.getExperiment) : undefined,
    ...rest
  };
}

export function getExperimentLazy({
  // Options
  ...options
}: GqlAPILazyQueryRequest<GetExperimentResponse, GetExperimentRequest>): GqlAPILazyQueryResponse<
  GetExperimentResponse,
  GetExperimentRequest
> {
  const [getExperimentQuery, result] = useLazyQuery<GetExperimentResponse, GetExperimentRequest>(
    gql`
      query getExperiment($projectID: ID!, $experimentID: String!) {
        getExperiment(projectID: $projectID, experimentID: $experimentID) {
          experimentDetails {
            experimentID
            recentExperimentRunDetails {
              experimentRunID
            }
          }
          averageResiliencyScore
        }
      }
    `,
    {
      ...options
    }
  );

  return [getExperimentQuery, result];
}
