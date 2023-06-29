import { gql, useLazyQuery } from '@apollo/client';
import type { Identifiers, Mode } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPILazyQueryResponse } from '@api/types';

export interface GetProbeYAMLRequest {
  identifiers: Identifiers;
  request: {
    probeID: string;
    mode: Mode;
  };
}

export interface GetProbeYAMLResponse {
  getProbeYAML: string;
}

export function getProbeYAML({
  // Identifiers
  projectID,
  // Params
  probeID,
  mode,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  GetProbeYAMLResponse,
  GetProbeYAMLRequest,
  GetProbeYAMLRequest['request']
>): GqlAPILazyQueryResponse<GetProbeYAMLResponse, GetProbeYAMLRequest> {
  // Query to get probe YAML
  const [getProbeYAMLQuery, result] = useLazyQuery<GetProbeYAMLResponse, GetProbeYAMLRequest>(
    gql`
      query getProbeYAML($request: GetProbeYAMLRequest!, $identifiers: IdentifiersRequest!) {
        getProbeYAML(request: $request, identifiers: $identifiers)
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        request: {
          probeID,
          mode
        }
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getProbeYAMLQuery, result];
}
