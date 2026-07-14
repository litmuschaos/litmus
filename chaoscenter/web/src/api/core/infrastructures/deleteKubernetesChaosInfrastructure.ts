import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface DeleteKubernetesChaosInfraRequest {
  projectID: string;
  infraID: string;
}

export interface DeleteKubernetesChaosInfraResponse {
  deleteChaosInfra: string;
}

export function deleteKubernetesChaosInfra(
  options?: GqlAPIMutationRequest<DeleteKubernetesChaosInfraResponse, DeleteKubernetesChaosInfraRequest>
): GqlAPIMutationResponse<DeleteKubernetesChaosInfraResponse, DeleteKubernetesChaosInfraRequest> {
  const [deleteChaosInfraMutation, result] = useMutation<
    DeleteKubernetesChaosInfraResponse,
    DeleteKubernetesChaosInfraRequest
  >(
    gql`
      mutation deleteInfra($projectID: ID!, $infraID: String!) {
        deleteInfra(projectID: $projectID, infraID: $infraID)
      }
    `,
    options
  );

  return [deleteChaosInfraMutation, result];
}
