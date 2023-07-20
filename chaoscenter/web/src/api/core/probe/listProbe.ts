import { gql, useQuery } from '@apollo/client';
import type { Identifiers, Probe } from '@api/entities';
import type { GqlAPIQueryResponse, GqlAPIQueryRequest } from '@api/types';

export interface ListProbeRequest {
  identifiers: Identifiers;
  probeIDs?: Array<string>;
}

export interface ListProbeResponse {
  listProbes: Array<Probe>;
}

export function listProbes({
  // Identifiers
  projectID,
  // Params
  probeIDs,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListProbeResponse, ListProbeRequest, Omit<ListProbeRequest, 'identifiers'>>): GqlAPIQueryResponse<
  ListProbeResponse,
  ListProbeRequest
> {
  // Query to List Probes
  const { data, loading, ...rest } = useQuery<ListProbeResponse, ListProbeRequest>(
    gql`
      query listProbes($probeIDs: [ID!], $identifiers: IdentifiersRequest!) {
        listProbes(probeIDs: $probeIDs, identifiers: $identifiers) {
          probeId
          name
          description
          type
          httpProperties {
            probeTimeout
            interval
            url
          }
          cmdProperties {
            probeTimeout
            interval
            command
          }
          promProperties {
            probeTimeout
            interval
          }
          updatedAt
          updatedBy {
            username
            email
          }
        }
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        probeIDs
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    ...rest
  };
}
