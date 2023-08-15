import { gql, useMutation } from '@apollo/client';
import type { AuthType, ChaosHub } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface CreateChaosHubRequest {
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

export interface AddChaoshubRequest {
  projectID: string;
  request: CreateChaosHubRequest;
}

export interface CreateChaosHubResponse {
  addChaosHub: ChaosHub;
}

export function addChaosHub(
  options?: GqlAPIMutationRequest<CreateChaosHubResponse, AddChaoshubRequest>
): GqlAPIMutationResponse<CreateChaosHubResponse, AddChaoshubRequest> {
  const [addChaosHubMutation, result] = useMutation<CreateChaosHubResponse, AddChaoshubRequest>(
    gql`
      mutation addChaosHub($projectID: ID!, $request: CreateChaosHubRequest!) {
        addChaosHub(request: $request, projectID: $projectID) {
          name
          repoURL
          repoBranch
          hubType
          isPrivate
        }
      }
    `,
    options
  );

  return [addChaosHubMutation, result];
}
