import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface DeleteEnvironmentRequest {
  projectID: string;
  environmentID: string;
}

export function deleteEnvironment(
  options?: GqlAPIMutationRequest<string, DeleteEnvironmentRequest>
): GqlAPIMutationResponse<string, DeleteEnvironmentRequest> {
  const [deleteEnvironmentMutation, result] = useMutation<string, DeleteEnvironmentRequest>(
    gql`
      mutation deleteEnvironment($projectID: ID!, $environmentID: ID!) {
        deleteEnvironment(environmentID: $environmentID, projectID: $projectID)
      }
    `,
    options
  );

  return [deleteEnvironmentMutation, result];
}
