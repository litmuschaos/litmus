import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';
import type { EnvironmentType } from '@api/entities';

interface UpdateEnvironmentProps {
  environmentID: string;
  name?: string;
  tags?: string[];
  description?: string;
  type?: EnvironmentType;
}

export interface UpdateEnvironmentRequest {
  projectID: string;
  request: UpdateEnvironmentProps;
}

export function updateEnvironment(
  options?: GqlAPIMutationRequest<string, UpdateEnvironmentRequest>
): GqlAPIMutationResponse<string, UpdateEnvironmentRequest> {
  const [updateEnvironmentMutation, result] = useMutation<string, UpdateEnvironmentRequest>(
    gql`
      mutation updateEnvironment($projectID: ID!, $request: UpdateEnvironmentRequest!) {
        updateEnvironment(request: $request, projectID: $projectID)
      }
    `,
    options
  );

  return [updateEnvironmentMutation, result];
}
