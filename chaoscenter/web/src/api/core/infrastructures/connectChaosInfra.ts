import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';
import type { Toleration } from '@models';
import type { InfrastructureType } from '@api/entities';

export interface connectChaosInfraRequest {
  projectID: string;
  request: {
    name: string;
    environmentID: string;
    description?: string;
    platformName: string;
    infraNamespace?: string;
    serviceAccount?: string;
    infraScope: string;
    infraNsExists?: boolean;
    infraSaExists?: boolean;
    skipSsl?: boolean;
    nodeSelector?: string;
    tolerations?: Array<Toleration>;
    infrastructureType?: InfrastructureType;
    tags?: Array<string>;
  };
}

export interface connectChaosInfraManifestModeResponse {
  registerInfra: {
    manifest: string;
  };
}

export function connectChaosInfraManifestMode(
  options?: GqlAPIMutationRequest<connectChaosInfraManifestModeResponse, connectChaosInfraRequest>
): GqlAPIMutationResponse<connectChaosInfraManifestModeResponse, connectChaosInfraRequest> {
  const [connectChaosInfraMutation, result] = useMutation<
    connectChaosInfraManifestModeResponse,
    connectChaosInfraRequest
  >(
    gql`
      mutation registerInfra($projectID: ID!, $request: RegisterInfraRequest!) {
        registerInfra(projectID: $projectID, request: $request) {
          manifest
        }
      }
    `,
    options
  );

  return [connectChaosInfraMutation, result];
}
