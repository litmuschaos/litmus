import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface UpdateCronExperimentStateRequest {
  disable: boolean;
  projectID: string;
  experimentID?: string;
}

export interface UpdateCronExperimentStateResponse {
  updateCronExperimentState: boolean;
}

export function useUpdateCronExperimentStateMutation(
  options?: GqlAPIMutationRequest<UpdateCronExperimentStateResponse, UpdateCronExperimentStateRequest>
): GqlAPIMutationResponse<UpdateCronExperimentStateResponse, UpdateCronExperimentStateRequest> {
  const [updateCronExperimentStateMutation, result] = useMutation<
    UpdateCronExperimentStateResponse,
    UpdateCronExperimentStateRequest
  >(
    gql`
      mutation updateCronExperimentState($experimentID: String!, $disable: Boolean!, $projectID: ID!) {
        updateCronExperimentState(experimentID: $experimentID, disable: $disable, projectID: $projectID)
      }
    `,
    options
  );

  return [updateCronExperimentStateMutation, result];
}
