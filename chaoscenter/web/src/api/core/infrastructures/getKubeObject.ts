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
    namespace: string;
  };
}

export interface KubeObjResponse {
  getKubeObject: {
    infraID: string;
    kubeObj: KubeObj;
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

interface KubeNamespace {
  name: string;
}

export interface KubeNamespaceRequest {
  request: {
    infraID: string;
  };
}

export interface KubeNamespaceResponse {
  getKubeNamespace: {
    infraID: string;
    kubeNamespace: Array<KubeNamespace>;
  };
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
          objectType: request.objectType,
          namespace: request.namespace
        }
      },
      ...options
    }
  );

  return { data, loading, error };
}

export function kubeNamespaceSubscription({
  request,
  ...options
}: GqlAPISubscriptionRequest<KubeNamespaceResponse, KubeNamespaceRequest>): GqlAPISubscriptionResponse<
  KubeNamespaceResponse,
  KubeNamespaceRequest
> {
  const { data, loading, error } = useSubscription<KubeNamespaceResponse, KubeNamespaceRequest>(
    gql`
      subscription getKubeNamespace($request: KubeNamespaceRequest!) {
        getKubeNamespace(request: $request) {
          infraID
          kubeNamespace {
            name
          }
        }
      }
    `,
    {
      variables: {
        request: {
          infraID: request.infraID
        }
      },
      ...options
    }
  );

  return { data, loading, error };
}
