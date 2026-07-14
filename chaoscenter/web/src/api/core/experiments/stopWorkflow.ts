import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface StopAllExperimentRequest {
  projectID: string;
}

export interface StopAllExperimentResponse {
  stopAllExperimentRuns: boolean;
}

export interface StopExperimentRequest {
  projectID: string;
  experimentID: string;
  experimentRunID?: string | undefined;
}

export interface StopExperimentResponse {
  stopExperimentRuns: boolean;
}

export function stopExperiment(
  options?: GqlAPIMutationRequest<StopExperimentResponse, StopExperimentRequest>
): GqlAPIMutationResponse<StopExperimentResponse, StopExperimentRequest> {
  const [stopExperimentMutation, result] = useMutation<StopExperimentResponse, StopExperimentRequest>(
    gql`
      mutation stopExperimentRuns($experimentID: String!, $projectID: ID!) {
        stopExperimentRuns(experimentID: $experimentID, projectID: $projectID)
      }
    `,
    options
  );

  return [stopExperimentMutation, result];
}

export function stopExperimentRun(
  options?: GqlAPIMutationRequest<StopExperimentResponse, StopExperimentRequest>
): GqlAPIMutationResponse<StopExperimentResponse, StopExperimentRequest> {
  const [stopExperimentRunMutation, result] = useMutation<StopExperimentResponse, StopExperimentRequest>(
    gql`
      mutation stopExperimentRuns($experimentID: String!, $experimentRunID: String, $projectID: ID!) {
        stopExperimentRuns(experimentID: $experimentID, experimentRunID: $experimentRunID, projectID: $projectID)
      }
    `,
    options
  );

  return [stopExperimentRunMutation, result];
}
