import { gql, useQuery, useLazyQuery } from '@apollo/client';
import type { InfrastructureType, Probe, ProbeFilterRequest } from '@api/entities';
import type {
  GqlAPIQueryResponse,
  GqlAPIQueryRequest,
  GqlAPILazyQueryResponse,
  GqlAPILazyQueryRequest
} from '@api/types';

export interface ListProbeRequest {
  projectID: string;
  probeNames?: Array<string>;
  infrastructureType?: InfrastructureType;
  filter?: ProbeFilterRequest;
}

export interface ListProbeResponse {
  listProbes: Array<Probe>;
}

export function listProbes({
  // Identifiers
  projectID,
  probeNames,
  infrastructureType,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListProbeResponse, ListProbeRequest>): GqlAPIQueryResponse<ListProbeResponse, ListProbeRequest> {
  // Query to List Probes
  const { data, loading, ...rest } = useQuery<ListProbeResponse, ListProbeRequest>(
    gql`
      query listProbes(
        $probeNames: [ID!]
        $infrastructureType: InfrastructureType
        $projectID: ID!
        $filter: ProbeFilterInput
      ) {
        listProbes(
          probeNames: $probeNames
          infrastructureType: $infrastructureType
          projectID: $projectID
          filter: $filter
        ) {
          name
          description
          type
          infrastructureType
          kubernetesHTTPProperties {
            probeTimeout
            interval
            url
          }
          kubernetesCMDProperties {
            probeTimeout
            interval
            command
          }
          promProperties {
            probeTimeout
            interval
          }
          recentExecutions {
            faultName
            status {
              verdict
            }
            executedByExperiment {
              experimentName
              experimentID
              updatedAt
              updatedBy {
                username
                email
              }
            }
          }
          referencedBy
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
        projectID,
        probeNames,
        infrastructureType,
        filter
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

export function minimalListProbes({
  // Identifiers
  projectID,
  // Params
  probeNames,
  infrastructureType,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<ListProbeResponse, ListProbeRequest>): GqlAPIQueryResponse<ListProbeResponse, ListProbeRequest> {
  // Query to List Probes
  const { data, loading, ...rest } = useQuery<ListProbeResponse, ListProbeRequest>(
    gql`
      query listProbes($probeNames: [ID!], $infrastructureType: InfrastructureType, $projectID: ID!) {
        listProbes(probeNames: $probeNames, infrastructureType: $infrastructureType, projectID: $projectID) {
          name
          type
        }
      }
    `,
    {
      variables: {
        projectID,
        probeNames,
        infrastructureType,
        filter
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

export function listLazyProbes({
  ...options
}: GqlAPILazyQueryRequest<ListProbeResponse, ListProbeRequest>): GqlAPILazyQueryResponse<
  ListProbeResponse,
  ListProbeRequest
> {
  // Query to List Probes
  const [listLazyProbeQuery, result] = useLazyQuery<ListProbeResponse, ListProbeRequest>(
    gql`
      query listProbes($probeNames: [ID!], $projectID: ID!, $filter: ProbeFilterInput) {
        listProbes(probeNames: $probeNames, projectID: $projectID, filter: $filter) {
          name
          description
          type
          tags
          type
          updatedBy {
            username
            email
          }
          kubernetesHTTPProperties {
            probeTimeout
            interval
            retry
            attempt
            evaluationTimeout
            probePollingInterval
            initialDelay
            stopOnFailure
            url
            method {
              get {
                criteria
                responseCode
              }
              post {
                contentType
                body
                bodyPath
                criteria
                responseCode
              }
            }
            insecureSkipVerify
          }
          promProperties {
            probeTimeout
            interval
            retry
            attempt
            evaluationTimeout
            probePollingInterval
            initialDelay
            stopOnFailure
            endpoint
            query
            queryPath
            comparator {
              type
              value
              criteria
            }
          }
          k8sProperties {
            probeTimeout
            interval
            retry
            attempt
            evaluationTimeout
            probePollingInterval
            initialDelay
            stopOnFailure
            group
            version
            resource
            resourceNames
            namespace
            fieldSelector
            labelSelector
            operation
          }
          kubernetesCMDProperties {
            probeTimeout
            interval
            retry
            attempt
            evaluationTimeout
            probePollingInterval
            initialDelay
            stopOnFailure
            command
            comparator {
              type
              value
              criteria
            }
          }
        }
      }
    `,
    {
      ...options
    }
  );

  return [listLazyProbeQuery, result];
}
