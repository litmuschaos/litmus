import { gql, useMutation } from '@apollo/client';
import type { FaultList } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface PushToChaosHubRequest {
  projectID: string;
  request: {
    id: string;
    workflowID?: string;
    scenarioName: string;
    description?: string;
    manifest?: string;
    tags: string[];
    experiments?: Array<FaultList>;
  };
}

export interface PushToChaosHubResponse {
  pushWorkflowToChaosHub: string;
}

export function pushWorkflowToChaosHub(
  options?: GqlAPIMutationRequest<PushToChaosHubResponse, PushToChaosHubRequest>
): GqlAPIMutationResponse<PushToChaosHubResponse, PushToChaosHubRequest> {
  const [pushWorkflowToChaosHubMutation, result] = useMutation<PushToChaosHubResponse, PushToChaosHubRequest>(
    gql`
      mutation pushWorkflowToGit($request: PushWorkflowToChaosHubInput!, $projectID: ID!) {
        pushWorkflowToChaosHub(request: $request, projectID: $projectID)
      }
    `,
    options
  );

  return [pushWorkflowToChaosHubMutation, result];
}
