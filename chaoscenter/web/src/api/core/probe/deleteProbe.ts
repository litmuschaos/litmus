import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface DeleteProbeRequest {
  projectID: string;
  probeName: string;
}

export interface DeleteProbeResponse {
  deleteProbe: boolean;
}

export function deleteProbe(
  options?: GqlAPIMutationRequest<DeleteProbeResponse, DeleteProbeRequest>
): GqlAPIMutationResponse<DeleteProbeResponse, DeleteProbeRequest> {
  const [deleteProbeMutation, result] = useMutation<DeleteProbeResponse, DeleteProbeRequest>(
    gql`
      mutation deleteProbe($probeName: ID!, $projectID: ID!) {
        deleteProbe(probeName: $probeName, projectID: $projectID)
      }
    `,
    options
  );

  return [deleteProbeMutation, result];
}
