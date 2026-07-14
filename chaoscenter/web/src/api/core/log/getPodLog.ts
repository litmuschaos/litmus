import { gql, useSubscription } from '@apollo/client';
import type { GqlAPISubscriptionRequest, GqlAPISubscriptionResponse } from '@api/types';

export interface GetPodLogResponse {
  getPodLog: {
    experimentRunID: string;
    podName: string;
    podType: string;
    log: string;
  };
}
// TODO: add identifiers to this API and modify the types accordingly
interface GetPodLogsRequest {
  request: {
    // requestID: string;
    infraID: string;
    experimentRunID?: string;
    podName: string;
    podNamespace: string;
    podType: string;
    expPod?: string;
    runnerPod?: string;
    chaosNamespace?: string;
  };
}

export function getPodLogsSubscription({
  request,
  ...options
}: GqlAPISubscriptionRequest<GetPodLogResponse, GetPodLogsRequest>): GqlAPISubscriptionResponse<
  GetPodLogResponse,
  GetPodLogsRequest
> {
  const { data, loading, ...rest } = useSubscription<GetPodLogResponse, GetPodLogsRequest>(
    gql`
      subscription podLog($request: PodLogRequest!) {
        getPodLog(request: $request) {
          log
        }
      }
    `,
    {
      variables: {
        request: {
          infraID: request.infraID,
          experimentRunID: request.experimentRunID,
          podName: request.podName,
          podNamespace: request.podNamespace,
          podType: request.podType,
          expPod: request.expPod,
          runnerPod: request.runnerPod,
          chaosNamespace: request.chaosNamespace
        }
      },
      ...options
    }
  );

  return {
    data,
    loading: loading,
    ...rest
  };
}
