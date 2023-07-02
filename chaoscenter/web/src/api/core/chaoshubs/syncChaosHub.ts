import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface SyncChaosHubRequest {
  projectID: string;
  id: string;
}

export interface SyncChaosHubResponse {
  syncChaosHub: string;
}

export function syncChaosHub(
  options?: GqlAPIMutationRequest<SyncChaosHubResponse, SyncChaosHubRequest>
): GqlAPIMutationResponse<SyncChaosHubResponse, SyncChaosHubRequest> {
  const [syncChaosHubMutation, result] = useMutation<SyncChaosHubResponse, SyncChaosHubRequest>(
    gql`
      mutation syncChaosHub($projectID: ID!, $id: ID!) {
        syncChaosHub(id: $id, projectID: $projectID)
      }
    `,
    options
  );

  return [syncChaosHubMutation, result];
}
