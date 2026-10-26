import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';
import type { UpdateGitOpsRequest } from '@api/entities/gitops';

export function updateGitOps(
  options?: GqlAPIMutationRequest<boolean, UpdateGitOpsRequest>
): GqlAPIMutationResponse<boolean, UpdateGitOpsRequest> {
  const [updateGitOpsMutation, result] = useMutation<boolean, UpdateGitOpsRequest>(
    gql`
      mutation updateGitOps($projectID: ID!, $configurations: GitConfig!) {
        updateGitOps(projectID: $projectID, configurations: $configurations)
      }
    `,
    options
  );

  return [updateGitOpsMutation, result];
}
