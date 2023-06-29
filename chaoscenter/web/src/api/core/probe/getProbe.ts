import { gql, useQuery, useLazyQuery } from '@apollo/client';
import type { GqlAPIQueryResponse, GqlAPIQueryRequest, GqlAPILazyQueryResponse } from '@api/types';
import type { Identifiers, Probe } from '@api/entities';

export interface GetProbeRequest {
  identifiers: Identifiers;
  probeID: string;
}

export interface GetProbeResponse {
  getProbe: Probe;
}

export function getProbe({
  // Identifiers
  projectID,
  // Params
  probeID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest, Omit<GetProbeRequest, 'identifiers'>>): GqlAPIQueryResponse<
  GetProbeResponse,
  GetProbeRequest
> {
  const { data, loading, ...rest } = useQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeID: ID!, $identifiers: IdentifiersRequest!) {
        getProbe(probeID: $probeID, identifiers: $identifiers) {
          probeId
          name
          description
          type
          createdAt
          updatedAt
        }
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        probeID
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

export function getHTTPProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeID,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  GetProbeResponse,
  GetProbeRequest,
  Omit<GetProbeRequest, 'identifiers'>
>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getHTTPProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeID: ID!, $identifiers: IdentifiersRequest!) {
        getProbe(probeID: $probeID, identifiers: $identifiers) {
          type
          httpProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
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
            responseTimeout
            insecureSkipVerify
          }
        }
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        probeID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getHTTPProbePropertiesQuery, result];
}

export function getPROMProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeID,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  GetProbeResponse,
  GetProbeRequest,
  Omit<GetProbeRequest, 'identifiers'>
>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getPROMProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeID: ID!, $identifiers: IdentifiersRequest!) {
        getProbe(probeID: $probeID, identifiers: $identifiers) {
          type
          promProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
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
        identifiers: {
          projectID
        },
        probeID
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
  probeID,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  GetProbeResponse,
  GetProbeRequest,
  Omit<GetProbeRequest, 'identifiers'>
>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getK8SProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeID: ID!, $identifiers: IdentifiersRequest!) {
        getProbe(probeID: $probeID, identifiers: $identifiers) {
          type
          k8sProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
            stopOnFailure
            group
            version
            resource
            namespace
            fieldSelector
            labelSelector
            operation
            data
          }
        }
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        probeID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getK8SProbePropertiesQuery, result];
}

export function getCMDProbeProperties({
  // Identifiers
  projectID,
  // Params
  probeID,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  GetProbeResponse,
  GetProbeRequest,
  Omit<GetProbeRequest, 'identifiers'>
>): GqlAPILazyQueryResponse<GetProbeResponse, GetProbeRequest> {
  const [getCMDProbePropertiesQuery, result] = useLazyQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeID: ID!, $identifiers: IdentifiersRequest!) {
        getProbe(probeID: $probeID, identifiers: $identifiers) {
          type
          cmdProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
            stopOnFailure
            command
            comparator {
              type
              value
              criteria
            }
            source {
              image
              hostNetwork
              inheritInputs
              args
              envList {
                name
                value
                valueFrom {
                  fieldRef {
                    apiVersion
                    fieldPath
                  }
                  resourceFieldRef {
                    containerName
                    resource
                    divisor
                  }
                  configMapKeyRef {
                    name {
                      name
                    }
                    key
                    optional
                  }
                  secretKeyRef {
                    name {
                      name
                    }
                    key
                    optional
                  }
                }
              }
              labels
              command
              imagePullPolicy
              privileged
              nodeSelector
              # volumes
              # volumesMount
              imagePullSecrets {
                name
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        probeID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getCMDProbePropertiesQuery, result];
}

export function getProbeAllProperties({
  // Identifiers
  projectID,
  // Params
  probeID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetProbeResponse, GetProbeRequest, Omit<GetProbeRequest, 'identifiers'>>): GqlAPIQueryResponse<
  GetProbeResponse,
  GetProbeRequest
> {
  // Query to list probes
  const { data, loading, ...rest } = useQuery<GetProbeResponse, GetProbeRequest>(
    gql`
      query getProbe($probeID: ID!, $identifiers: IdentifiersRequest!) {
        getProbe(probeID: $probeID, identifiers: $identifiers) {
          name
          description
          type
          tags
          type
          probeId
          httpProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
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
            responseTimeout
            insecureSkipVerify
          }
          promProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
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
            probePollingInterval
            initialDelaySeconds
            stopOnFailure
            group
            version
            resource
            namespace
            fieldSelector
            labelSelector
            operation
            data
          }
          cmdProperties {
            probeTimeout
            interval
            retry
            probePollingInterval
            initialDelaySeconds
            stopOnFailure
            command
            comparator {
              type
              value
              criteria
            }
            source {
              image
              hostNetwork
              inheritInputs
              args
              envList {
                name
                value
                valueFrom {
                  fieldRef {
                    apiVersion
                    fieldPath
                  }
                  resourceFieldRef {
                    containerName
                    resource
                    divisor
                  }
                  configMapKeyRef {
                    name {
                      name
                    }
                    key
                    optional
                  }
                  secretKeyRef {
                    name {
                      name
                    }
                    key
                    optional
                  }
                }
              }
              labels
              command
              imagePullPolicy
              privileged
              nodeSelector
              # volumes
              # volumesMount
              imagePullSecrets {
                name
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        identifiers: {
          projectID
        },
        probeID
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
