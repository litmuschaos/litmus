import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';
import type { EnableGitOpsRequest } from '@api/entities/gitops';

export function enableGitOps(
  options?: GqlAPIMutationRequest<boolean, EnableGitOpsRequest>
): GqlAPIMutationResponse<boolean, EnableGitOpsRequest> {
  const [enableGitOpsMutation, result] = useMutation<boolean, EnableGitOpsRequest>(
    gql`
      mutation enableGitOps($projectID: ID!, $configurations: GitConfig!) {
        enableGitOps(projectID: $projectID, configurations: $configurations)
      }
    `,
    options
  );

  return [enableGitOpsMutation, result];
}
