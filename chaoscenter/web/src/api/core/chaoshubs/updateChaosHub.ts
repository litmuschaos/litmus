import { gql, useMutation } from '@apollo/client';
import type { AuthType, ChaosHub } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

interface EditChaosHubRequest {
  id: string;
  name: string;
  tags: string[];
  description?: string;
  repoURL: string;
  repoBranch: string;
  isPrivate: boolean;
  authType: AuthType;
  token?: string;
  userName?: string;
  password?: string;
  sshPublicKey?: string;
  sshPrivateKey?: string;
}

export interface UpdateChaosHubRequest {
  projectID: string;
  request: EditChaosHubRequest;
}

export interface UpdateChaosHubResponse {
  updateChaosHub: ChaosHub;
}

export function updateChaosHub(
  options?: GqlAPIMutationRequest<UpdateChaosHubResponse, UpdateChaosHubRequest>
): GqlAPIMutationResponse<UpdateChaosHubResponse, UpdateChaosHubRequest> {
  const [updateChaosHubMutation, result] = useMutation<UpdateChaosHubResponse, UpdateChaosHubRequest>(
    gql`
      mutation updateChaosHub($projectID: ID!, $request: UpdateChaosHubRequest!) {
        updateChaosHub(projectID: $projectID, request: $request) {
          name
          repoURL
          repoBranch
        }
      }
    `,
    options
  );

  return [updateChaosHubMutation, result];
}
