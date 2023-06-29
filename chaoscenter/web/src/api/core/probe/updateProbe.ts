import { gql, useMutation } from '@apollo/client';
import type { Identifiers, Probe, ProbeType } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface UpdateProbeRequest {
  identifiers: Identifiers;
  request: {
    probeId: string;
    name: string;
    description?: string;
    tags?: Array<string>;
    type: ProbeType;
    httpProperties?: Probe['httpProperties'];
    cmdProperties?: Probe['cmdProperties'];
    k8sProperties?: Probe['k8sProperties'];
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
      mutation updateProbe($request: ProbeRequest!, $identifiers: IdentifiersRequest!) {
        updateProbe(request: $request, identifiers: $identifiers)
      }
    `,
    options
  );

  return [updateProbeMutation, result];
}
