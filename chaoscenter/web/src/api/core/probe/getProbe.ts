import { gql, useQuery, useLazyQuery } from '@apollo/client';
import type {
  GqlAPIQueryResponse,
  GqlAPIQueryRequest,
  GqlAPILazyQueryResponse,
  GqlAPILazyQueryRequest
} from '@api/types';
import type { Probe } from '@api/entities';

export interface GetProbeRequest {
  projectID: string;
  probeName: string;
}

export interface GetProbeResponse {
  getProbe: Probe;
}

export function getProbe({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPIQueryResponse<GetProbeResponse, GetProbeRequest> {
  const { data, loading, ...rest } = useQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          name
          description
          type
          infrastructureType
          createdAt
          updatedAt
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
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

export function getLazyProbe({
  ...options
}: GqlAPILazyQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPILazyQueryResponse<
  GetProbeResponse,
  GetProbeRequest
> {
  // Query to get probe YAML
  const [getLazyProbeQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          name
          description
          type
          tags
          type
          infrastructureType
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
            source
          }
        }
      }
    `,
    {
      ...options
    }
  );

  return [getLazyProbeQuery, result];
}

export function getKubernetesHTTPProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getKubernetesHTTPProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          type
          infrastructureType
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
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getKubernetesHTTPProbePropertiesQuery, result];
}

export function getPROMProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getPROMProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          type
          infrastructureType
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
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getPROMProbePropertiesQuery, result];
}

export function getK8SProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getK8SProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          type
          infrastructureType
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
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getK8SProbePropertiesQuery, result];
}

export function getKubernetesCMDProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getKubernetesCMDProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          type
          infrastructureType
          kubernetesCMDProperties {
            probeTimeout
            interval
            attempt
            evaluationTimeout
            retry
            probePollingInterval
            initialDelay
            stopOnFailure
            command
            comparator {
              type
              value
              criteria
            }
            source
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getKubernetesCMDProbePropertiesQuery, result];
}

export function getProbeAllProperties({
  // Identifiers
  projectID,
  // Params
  probeName,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest>): GqlAPIQueryResponse<GetProbeResponse, GetProbeRequest> {
  // Query to list probes
  const { data, loading, ...rest } = useQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeName: ID!, $projectID: ID!) {
        getProbe(probeName: $probeName, projectID: $projectID) {
          name
          description
          type
          tags
          type
          infrastructureType
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
            source
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        probeName
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
