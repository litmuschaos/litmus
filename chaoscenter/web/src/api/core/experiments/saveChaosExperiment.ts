import { gql, useMutation } from '@apollo/client';
import type { ExperimentCreationType } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface SaveChaosExperimentRequest {
  projectID: string;
  request: {
    id: string;
    name: string;
    description?: string;
    tags?: Array<string>;
    infraID: string;
    // infraType?: InfrastructureType;
    type?: ExperimentCreationType;
    manifest: string;
  };
}

export interface SaveChaosExperimentResponse {
  saveChaosExperiment: string;
}

export function saveChaosExperiment(
  options?: GqlAPIMutationRequest<SaveChaosExperimentResponse, SaveChaosExperimentRequest>
): GqlAPIMutationResponse<SaveChaosExperimentResponse, SaveChaosExperimentRequest> {
  const [saveChaosExperimentMutation, result] = useMutation<SaveChaosExperimentResponse, SaveChaosExperimentRequest>(
    gql`
      mutation saveChaosExperiment($projectID: ID!, $request: SaveChaosExperimentRequest!) {
        saveChaosExperiment(request: $request, projectID: $projectID)
      }
    `,
    options
  );

  return [saveChaosExperimentMutation, result];
}
