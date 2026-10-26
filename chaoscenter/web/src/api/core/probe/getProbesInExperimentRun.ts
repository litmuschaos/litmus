import { gql, useLazyQuery } from '@apollo/client';
import type { GqlAPILazyQueryRequest, GqlAPILazyQueryResponse } from '@api/types';
import type { Mode, Probe, Status } from '@api/entities';

export interface GetProbesInExperimentRunRequest {
  projectID: string;
  experimentRunID: string;
  faultName: string;
}

export interface ProbeInRuns {
  probe: Probe;
  mode: Mode;
  status: Status;
}

export interface GetProbesInExperimentRunResponse {
  getProbesInExperimentRun: ProbeInRuns[];
}

export function getProbesInExperimentRun({
  ...options
}: GqlAPILazyQueryRequest<GetProbesInExperimentRunResponse, GetProbesInExperimentRunRequest>): GqlAPILazyQueryResponse<
  GetProbesInExperimentRunResponse,
  GetProbesInExperimentRunRequest
> {
  // Query to List workflows
  const [getProbesInExperimentRunQuery, result] = useLazyQuery<
    GetProbesInExperimentRunResponse,
    GetProbesInExperimentRunRequest
  >(
    gql`
      query GetProbesInExperimentRun($projectID: ID!, $experimentRunID: String!, $faultName: String!) {
        getProbesInExperimentRun(projectID: $projectID, experimentRunID: $experimentRunID, faultName: $faultName) {
          probe {
            name
            type
            infrastructureType
            kubernetesHTTPProperties {
              probeTimeout
              interval
              retry
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
              attempt
              evaluationTimeout
            }
            promProperties {
              probeTimeout
              interval
              retry
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
              attempt
              evaluationTimeout
            }
            k8sProperties {
              probeTimeout
              interval
              retry
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
              attempt
              evaluationTimeout
            }
            kubernetesCMDProperties {
              probeTimeout
              interval
              retry
              attempt
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
              evaluationTimeout
            }
          }
          mode
          status {
            verdict
            description
          }
        }
      }
    `,
    {
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getProbesInExperimentRunQuery, result];
}
