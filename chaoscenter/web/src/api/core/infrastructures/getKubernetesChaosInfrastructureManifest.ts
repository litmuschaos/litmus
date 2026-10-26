import { gql, useLazyQuery } from '@apollo/client';
import type { GqlAPILazyQueryResponse, GqlAPIQueryRequest } from '../../types';

export interface GetKubernetesChaosInfrastructureManifestRequest {
  projectID: string;
  infraID: string;
  upgrade: boolean;
}

export interface GetKubernetesChaosManifestManifestResponse {
  getInfraManifest: string;
}

export function getKubernetesChaosInfrastructureManifest({
  projectID,
  // Param
  infraID,
  upgrade,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  GetKubernetesChaosManifestManifestResponse,
  GetKubernetesChaosInfrastructureManifestRequest,
  Omit<GetKubernetesChaosInfrastructureManifestRequest, 'projectID'>
>): GqlAPILazyQueryResponse<
  GetKubernetesChaosManifestManifestResponse,
  GetKubernetesChaosInfrastructureManifestRequest
> {
  const [getKubernetesChaosInfrastructureManifestQuery, result] = useLazyQuery<
    GetKubernetesChaosManifestManifestResponse,
    GetKubernetesChaosInfrastructureManifestRequest
  >(
    gql`
      query getInfraManifest($projectID: ID!, $infraID: ID!, $upgrade: Boolean!) {
        getInfraManifest(projectID: $projectID, infraID: $infraID, upgrade: $upgrade)
      }
    `,
    {
      variables: {
        projectID,
        infraID: infraID,
        upgrade: upgrade
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );
  return [getKubernetesChaosInfrastructureManifestQuery, result];
}
