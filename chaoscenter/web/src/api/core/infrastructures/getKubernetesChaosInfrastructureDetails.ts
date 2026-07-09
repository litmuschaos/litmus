import { gql, useQuery } from '@apollo/client';
import type { KubernetesChaosInfrastructure } from '../../entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '../../types';

export interface GetKubernetesChaosInfrastructureDetailsRequest {
  infraID: string;
  projectID: string;
}

export interface GetKubernetesChaosInfrastructureDetailsResponse {
  getInfraDetails: KubernetesChaosInfrastructure;
}

export const getChaosInfraDetails = ({
  infraID,
  options = {},
  projectID
}: GqlAPIQueryRequest<
  GetKubernetesChaosInfrastructureDetailsResponse,
  GetKubernetesChaosInfrastructureDetailsRequest,
  Omit<GetKubernetesChaosInfrastructureDetailsRequest, 'projectID'>
>): GqlAPIQueryResponse<
  GetKubernetesChaosInfrastructureDetailsResponse,
  GetKubernetesChaosInfrastructureDetailsRequest
> => {
  const { data, loading, ...rest } = useQuery<
    GetKubernetesChaosInfrastructureDetailsResponse,
    GetKubernetesChaosInfrastructureDetailsRequest
  >(
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
      ...options,
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      variables: { infraID, projectID }
    }
  );
  return {
    data,
    exists: (options as { skip?: boolean }).skip ? undefined : Boolean(data?.getInfraDetails),
    loading: (options as { skip?: boolean }).skip ? false : loading || !data,
    ...rest
  };
};
