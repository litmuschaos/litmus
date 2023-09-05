import { gql, useMutation } from '@apollo/client';
import type { InfrastructureType, Probe, ProbeType } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface AddProbeRequest {
  projectID: string;
  request: {
    name: string;
    description?: string;
    tags?: Array<string>;
    type: ProbeType;
    infrastructureType: InfrastructureType;
    kubernetesHTTPProperties?: Probe['kubernetesHTTPProperties'];
    // CMD
    kubernetesCMDProperties?: Probe['kubernetesCMDProperties'];
    // K8S
    k8sProperties?: Probe['k8sProperties'];
    // PROM
    promProperties?: Probe['promProperties'];
  };
}

export interface AddProbeResponse {
  addProbe: Probe;
}

export function addKubernetesHTTPProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addKubernetesHTTPProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addKubernetesHTTPProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
          name
          description
          type
          kubernetesHTTPProperties {
            probeTimeout
            interval
            url
            insecureSkipVerify
          }
        }
      }
    `,
    options
  );

  return [addKubernetesHTTPProbeMutation, result];
}

export function addKubernetesCMDProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addKubernetesCMDProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addKubernetesCMDProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
          name
          description
          type
          kubernetesCMDProperties {
            probeTimeout
            interval
            command
            comparator {
              type
              value
            }
          }
        }
      }
    `,
    options
  );

  return [addKubernetesCMDProbeMutation, result];
}

export function addPROMProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addPROMProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addPROMProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
          name
          description
          type
          promProperties {
            probeTimeout
            interval
            retry
            comparator {
              type
              value
            }
          }
        }
      }
    `,
    options
  );

  return [addPROMProbeMutation, result];
}

export function addK8SProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addK8SProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addK8SProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
          name
          description
          type
          k8sProperties {
            probeTimeout
            interval
            retry
            group
            version
            resource
            namespace
          }
        }
      }
    `,
    options
  );

  return [addK8SProbeMutation, result];
}
