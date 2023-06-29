import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';
import type { Environment, EnvironmentType } from '@api/entities';

interface CreateEnvironmentProps {
  name: string;
  tags?: string[];
  description?: string;
  environmentID: string;
  type: EnvironmentType;
}

export interface CreateEnvironmentRequest {
  projectID: string;
  request: CreateEnvironmentProps;
}

export interface CreateEnvironmentResponse {
  createEnvironment: Environment;
}

export function createEnvironment(
  options?: GqlAPIMutationRequest<CreateEnvironmentResponse, CreateEnvironmentRequest>
): GqlAPIMutationResponse<CreateEnvironmentResponse, CreateEnvironmentRequest> {
  const [createEnvironmentMutation, result] = useMutation<CreateEnvironmentResponse, CreateEnvironmentRequest>(
    gql`
      mutation createEnvironment($projectID: ID!, $request: CreateEnvironmentRequest!) {
        createEnvironment(request: $request, projectID: $projectID) {
          environmentID
          name
          description
          tags
          projectID
          type
          createdAt
          updatedAt
          isRemoved
          infraIDs
        }
      }
    `,
    options
  );

  return [createEnvironmentMutation, result];
}
