import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface DeleteChaosExperimentRequest {
  projectID: string;
  experimentID: string;
  experimentRunID?: string;
}

export interface DeleteChaosExperimentResponse {
  deleteChaosExperiment: boolean;
}

export function deleteChaosExperiment(
  options?: GqlAPIMutationRequest<DeleteChaosExperimentResponse, DeleteChaosExperimentRequest>
): GqlAPIMutationResponse<DeleteChaosExperimentResponse, DeleteChaosExperimentRequest> {
  const [deleteChaosExperimentMutation, result] = useMutation<
    DeleteChaosExperimentResponse,
    DeleteChaosExperimentRequest
  >(
    gql`
      mutation deleteChaosExperiment($experimentID: String!, $experimentRunID: String, $projectID: ID!) {
        deleteChaosExperiment(experimentID: $experimentID, experimentRunID: $experimentRunID, projectID: $projectID)
      }
    `,
    options
  );

  return [deleteChaosExperimentMutation, result];
}
