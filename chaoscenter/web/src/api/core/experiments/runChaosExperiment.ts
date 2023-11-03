import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface RunChaosExperimentRequest {
  projectID: string;
  experimentID: string;
}

export interface RunChaosExperimentResponse {
  runChaosExperiment: {
    notifyID: string;
  };
}

export function runChaosExperiment(
  options?: GqlAPIMutationRequest<RunChaosExperimentResponse, RunChaosExperimentRequest>
): GqlAPIMutationResponse<RunChaosExperimentResponse, RunChaosExperimentRequest> {
  const [runChaosExperimentMutation, result] = useMutation<RunChaosExperimentResponse, RunChaosExperimentRequest>(
    gql`
      mutation runChaosExperiment($projectID: ID!, $experimentID: String!) {
        runChaosExperiment(experimentID: $experimentID, projectID: $projectID) {
          notifyID
        }
      }
    `,
    options
  );

  return [runChaosExperimentMutation, result];
}
