import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface TestKubernetesChaosInfrastructureConnectionRequest {
  projectID: string;
  infraId: string;
}

export interface TestKubernetesChaosInfrastructureConnectionResponse {
  testKubernetesInfraConnection: boolean;
}

export function testKubernetesChaosInfrastructureConnection(
  options?: GqlAPIMutationRequest<
    TestKubernetesChaosInfrastructureConnectionResponse,
    TestKubernetesChaosInfrastructureConnectionRequest
  >
): GqlAPIMutationResponse<
  TestKubernetesChaosInfrastructureConnectionResponse,
  TestKubernetesChaosInfrastructureConnectionRequest
> {
  const [testKubernetesChaosInfrastructureConnectionMutation, result] = useMutation<
    TestKubernetesChaosInfrastructureConnectionResponse,
    TestKubernetesChaosInfrastructureConnectionRequest
  >(
    gql`
      mutation testKubernetesChaosInfrastuctureConnection($projectID: ID!, $infraId: String!) {
        testKubernetesInfraConnection(projectID: $projectID, infraId: $infraId)
      }
    `,
    options
  );

  return [testKubernetesChaosInfrastructureConnectionMutation, result];
}
