import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';
import type { DisableGitOpsRequest } from '@api/entities/gitops';

export function disableGitOps(
  options?: GqlAPIMutationRequest<boolean, DisableGitOpsRequest>
): GqlAPIMutationResponse<boolean, DisableGitOpsRequest> {
  const [disableGitOpsMutation, result] = useMutation<boolean, DisableGitOpsRequest>(
    gql`
      mutation disableGitOps($projectID: ID!) {
        disableGitOps(projectID: $projectID)
      }
    `,
    options
  );

  return [disableGitOpsMutation, result];
}
