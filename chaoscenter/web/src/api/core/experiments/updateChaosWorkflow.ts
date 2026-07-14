import { gql, useMutation } from '@apollo/client';
import type { ExperimentCreationType, InfrastructureType, Weightages } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface UpdateChaosExperimentRequest {
  projectID: string;
  request: {
    experimentID: string;
    runExperiment?: boolean;
    experimentManifest: string;
    experimentType?: ExperimentCreationType;
    cronSyntax: string;
    experimentName: string;
    experimentDescription: string;
    weightages: Array<Weightages>;
    isCustomExperiment: boolean;
    infraID: string;
    tags?: Array<string>;
    infraType?: InfrastructureType;
  };
}

export interface UpdateChaosExperimentResponse {
  updateChaosExperiment: {
    experimentID: string;
    projectID: string;
    cronSyntax: string;
    experimentName: string;
    experimentDescription: string;
    isCustomExperiment: boolean;
    tags?: Array<string>;
  };
}

export function updateChaosExperiment(
  options?: GqlAPIMutationRequest<UpdateChaosExperimentResponse, UpdateChaosExperimentRequest>
): GqlAPIMutationResponse<UpdateChaosExperimentResponse, UpdateChaosExperimentRequest> {
  const [updateChaosExperimentMutation, result] = useMutation<
    UpdateChaosExperimentResponse,
    UpdateChaosExperimentRequest
  >(
    gql`
      mutation updateChaosExperiment($projectID: ID!, $request: ChaosWorkFlowRequest!) {
        updateChaosExperiment(request: $request, projectID: $projectID) {
          experimentName
          experimentID
        }
      }
    `,
    options
  );

  return [updateChaosExperimentMutation, result];
}
