import { gql, useMutation } from '@apollo/client';
import type { Identifiers } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface DeleteProbeRequest {
  identifiers: Identifiers;
  probeID: string;
}

export interface DeleteProbeResponse {
  deleteProbe: boolean;
}

export function deleteProbe(
  options?: GqlAPIMutationRequest<DeleteProbeResponse, DeleteProbeRequest>
): GqlAPIMutationResponse<DeleteProbeResponse, DeleteProbeRequest> {
  const [deleteProbeMutation, result] = useMutation<DeleteProbeResponse, DeleteProbeRequest>(
    gql`
      mutation deleteChaosHub($probeID: ID!, $identifiers: IdentifiersRequest!) {
        deleteProbe(probeID: $probeID, identifiers: $identifiers)
      }
    `,
    options
  );

  return [deleteProbeMutation, result];
}
