import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface DeleteChaosHubRequest {
  projectID: string;
  hubID: string;
}

export interface DeleteChaosHubResponse {
  deleteChaosHub: boolean;
}

export function deleteChaosHub(
  options?: GqlAPIMutationRequest<DeleteChaosHubResponse, DeleteChaosHubRequest>
): GqlAPIMutationResponse<DeleteChaosHubResponse, DeleteChaosHubRequest> {
  const [deleteChaosHubMutation, result] = useMutation<DeleteChaosHubResponse, DeleteChaosHubRequest>(
    gql`
      mutation deleteChaosHub($hubID: ID!, $projectID: ID!) {
        deleteChaosHub(hubID: $hubID, projectID: $projectID)
      }
    `,
    options
  );

  return [deleteChaosHubMutation, result];
}
