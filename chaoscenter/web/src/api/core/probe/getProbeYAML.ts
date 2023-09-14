import { gql, useLazyQuery } from '@apollo/client';
import type { Mode } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPILazyQueryResponse } from '@api/types';

export interface GetProbeYAMLRequest {
  projectID: string;
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
      query getProbeYAML($request: GetProbeYAMLRequest!, $projectID: ID!) {
        getProbeYAML(request: $request, projectID: $projectID)
      }
    `,
    {
      variables: {
        projectID,
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
