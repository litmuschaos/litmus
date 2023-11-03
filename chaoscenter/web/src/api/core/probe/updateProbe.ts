import { gql, useMutation } from '@apollo/client';
import type { InfrastructureType, Probe, ProbeType } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface UpdateProbeRequest {
  projectID: string;
  request: {
    name: string;
    description?: string;
    tags?: Array<string>;
    type: ProbeType;
    infrastructureType?: InfrastructureType;
    // HTTP
    kubernetesHTTPProperties?: Probe['kubernetesHTTPProperties'];
    // CMD
    kubernetesCMDProperties?: Probe['kubernetesCMDProperties'];
    // K8S
    k8sProperties?: Probe['k8sProperties'];
    // PROM
    promProperties?: Probe['promProperties'];
  };
}

export interface UpdateProbeResponse {
  updateProbe: string;
}

export function updateProbe(
  options?: GqlAPIMutationRequest<UpdateProbeResponse, UpdateProbeRequest>
): GqlAPIMutationResponse<UpdateProbeResponse, UpdateProbeRequest> {
  const [updateProbeMutation, result] = useMutation<UpdateProbeResponse, UpdateProbeRequest>(
    gql`
      mutation updateProbe($request: ProbeRequest!, $projectID: ID!) {
        updateProbe(request: $request, projectID: $projectID)
      }
    `,
    options
  );

  return [updateProbeMutation, result];
}
