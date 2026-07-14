import { gql, useMutation } from '@apollo/client';
import type { ExperimentCreationType, Weightages } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface CreateChaosExperimentRequest {
  projectID: string;
  request: {
    experimentID?: string;
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
  };
}

export interface CreateChaosExperimentResponse {
  createChaosWorkFlow: {
    experimentID: string;
    projectID: string;
    cronSyntax: string;
    experimentName: string;
    experimentDescription: string;
    isCustomExperiment: boolean;
    tags?: Array<string>;
  };
}

export function createChaosExperiment(
  options?: GqlAPIMutationRequest<CreateChaosExperimentResponse, CreateChaosExperimentRequest>
): GqlAPIMutationResponse<CreateChaosExperimentResponse, CreateChaosExperimentRequest> {
  const [createChaosExperimentMutation, result] = useMutation<
    CreateChaosExperimentResponse,
    CreateChaosExperimentRequest
  >(
    gql`
      mutation createChaosWorkFlow($projectID: ID!, $request: CreateChaosHubRequest!) {
        createChaosWorkFlow(request: $request, projectID: $projectID) {
          experimentName
          experimentID
        }
      }
    `,
    options
  );

  return [createChaosExperimentMutation, result];
}
