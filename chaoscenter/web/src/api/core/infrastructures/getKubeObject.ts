import { gql, useSubscription } from '@apollo/client';
import type { GqlAPISubscriptionRequest, GqlAPISubscriptionResponse } from '@api/types';

export interface KubeGVRRequest {
  group: string;
  version: string;
  resource: string;
}

export interface KubeObjRequest {
  request: {
    infraID: string;
    objectType: string;
    kubeObjRequest?: KubeGVRRequest;
  };
}

export interface KubeObjResponse {
  getKubeObject: {
    infraID: string;
    kubeObj: Array<KubeObj>;
  };
}

interface KubeObj {
  namespace: string;
  data: Array<KubeObjData>;
}

interface KubeObjData {
  labels?: Array<string>;
  name: string;
}

export function kubeObjectSubscription({
  request,
  ...options
}: GqlAPISubscriptionRequest<KubeObjResponse, KubeObjRequest>): GqlAPISubscriptionResponse<
  KubeObjResponse,
  KubeObjRequest
> {
  const { data, loading, error } = useSubscription<KubeObjResponse, KubeObjRequest>(
    gql`
      subscription getKubeObject($request: KubeObjectRequest!) {
        getKubeObject(request: $request) {
          infraID
          kubeObj {
            namespace
            data {
              labels
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        request: {
          infraID: request.infraID,
          kubeObjRequest: request.kubeObjRequest,
          objectType: request.objectType
        }
      },
      ...options
    }
  );

  return { data, loading, error };
}
