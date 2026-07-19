import { gql, useQuery } from '@apollo/client';
import type { KubernetesChaosInfrastructure } from '../../entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '../../types';

export interface GetInfraDetailsRequest {
  projectID: string;
  infraID: string;
}

export interface GetInfraDetailsResponse {
  getInfraDetails: KubernetesChaosInfrastructure;
}

export function getInfraDetails({
  projectID,
  infraID,
  options = {}
}: GqlAPIQueryRequest<GetInfraDetailsResponse, GetInfraDetailsRequest, never>): GqlAPIQueryResponse<
  GetInfraDetailsResponse,
  GetInfraDetailsRequest
> {
  const { data, loading, ...rest } = useQuery<GetInfraDetailsResponse, GetInfraDetailsRequest>(
    gql`
      query getInfraDetails($projectID: ID!, $infraID: ID!) {
        getInfraDetails(projectID: $projectID, infraID: $infraID) {
          infraID
          name
          environmentID
          description
          platformName
          isActive
          isInfraConfirmed
          updatedAt
          createdAt
          noOfExperiments
          noOfExperimentRuns
          lastExperimentTimestamp
          infraNamespace
          serviceAccount
          infraScope
          startTime
          version
          tags
          updateStatus
        }
      }
    `,
    {
      variables: {
        projectID,
        infraID
      },
      skip: !infraID,
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
