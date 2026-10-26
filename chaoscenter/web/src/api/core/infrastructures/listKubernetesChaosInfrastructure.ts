import { gql, useQuery } from '@apollo/client';
import type { KubernetesInfrastructureFilterInput } from '@models';
import type { KubernetesChaosInfrastructure, Pagination } from '../../entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '../../types';

export interface ListKubernetesChaosInfrastructureRequest {
  projectID: string;
  request: {
    infraIDs?: Array<string>;
    k8sConnectorIDs?: Array<string>;
    environmentIDs?: Array<string>;
    pagination?: Pagination;
    filter?: KubernetesInfrastructureFilterInput;
  };
}

export interface ListKubernetesChaosInfrastructure {
  totalNoOfInfras: number;
  infras: Array<KubernetesChaosInfrastructure>;
}

export interface ListKubernetesChaosInfrastructureResponse {
  listInfras: ListKubernetesChaosInfrastructure;
}

export function listChaosInfra({
  projectID,
  // Params
  infraIDs,
  k8sConnectorIDs,
  environmentIDs,
  pagination,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  ListKubernetesChaosInfrastructureResponse,
  ListKubernetesChaosInfrastructureRequest,
  ListKubernetesChaosInfrastructureRequest['request']
>): GqlAPIQueryResponse<ListKubernetesChaosInfrastructureResponse, ListKubernetesChaosInfrastructureRequest> {
  const { data, loading, ...rest } = useQuery<
    ListKubernetesChaosInfrastructureResponse,
    ListKubernetesChaosInfrastructureRequest
  >(
    gql`
      query listInfras($projectID: ID!, $request: ListInfraRequest) {
        listInfras(projectID: $projectID, request: $request) {
          totalNoOfInfras
          infras {
            infraID
            name
            environmentID
            description
            platformName
            isActive
            isInfraConfirmed
            updatedAt
            createdAt
            noOfExperiments
            noOfExperimentRuns
            lastExperimentTimestamp
            infraNamespace
            serviceAccount
            infraScope
            startTime
            version
            tags
            version
            updateStatus
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        request: {
          infraIDs: infraIDs,
          k8sConnectorIDs: k8sConnectorIDs,
          environmentIDs: environmentIDs,
          pagination: pagination,
          filter: filter
        }
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );
  return {
    data,
    loading: loading || !data,
    exists: data ? Boolean(data.listInfras.totalNoOfInfras) : undefined,
    ...rest
  };
}

export function listChaosInfraMinimal({
  projectID,
  // Params
  infraIDs,
  environmentIDs,
  pagination,
  filter,
  // Options
  options = {}
}: GqlAPIQueryRequest<
  ListKubernetesChaosInfrastructureResponse,
  ListKubernetesChaosInfrastructureRequest,
  ListKubernetesChaosInfrastructureRequest['request']
>): GqlAPIQueryResponse<ListKubernetesChaosInfrastructureResponse, ListKubernetesChaosInfrastructureRequest> {
  const { data, loading, ...rest } = useQuery<
    ListKubernetesChaosInfrastructureResponse,
    ListKubernetesChaosInfrastructureRequest
  >(
    gql`
      query listInfras($projectID: ID!, $request: ListInfraRequest) {
        listInfras(projectID: $projectID, request: $request) {
          totalNoOfInfras
          infras {
            infraID
            name
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        request: {
          infraIDs,
          environmentIDs,
          pagination,
          filter
        }
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
