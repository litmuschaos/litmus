import { gql, useMutation } from '@apollo/client';
import type { Identifiers, Probe, ProbeType } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface AddProbeRequest {
  identifiers: Identifiers;
  request: {
    probeId?: string;
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

export interface AddProbeResponse {
  addProbe: Probe;
}

export function addHTTPProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addHTTPProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addHTTPProbe($request: ProbeRequest!, $identifiers: IdentifiersRequest!) {
        addProbe(request: $request, identifiers: $identifiers) {
          probeId
          name
          description
          type
          httpProperties {
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

  return [addHTTPProbeMutation, result];
}

export function addCMDProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addCMDProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addCMDProbe($request: ProbeRequest!, $identifiers: IdentifiersRequest!) {
        addProbe(request: $request, identifiers: $identifiers) {
          probeId
          name
          description
          type
          cmdProperties {
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

  return [addCMDProbeMutation, result];
}

export function addPROMProbe(
  options?: GqlAPIMutationRequest<AddProbeResponse, AddProbeRequest>
): GqlAPIMutationResponse<AddProbeResponse, AddProbeRequest> {
  const [addPROMProbeMutation, result] = useMutation<AddProbeResponse, AddProbeRequest>(
    gql`
      mutation addPROMProbe($request: ProbeRequest!, $identifiers: IdentifiersRequest!) {
        addProbe(request: $request, identifiers: $identifiers) {
          probeId
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
      mutation addK8SProbe($request: ProbeRequest!, $identifiers: IdentifiersRequest!) {
        addProbe(request: $request, identifiers: $identifiers) {
          probeId
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
