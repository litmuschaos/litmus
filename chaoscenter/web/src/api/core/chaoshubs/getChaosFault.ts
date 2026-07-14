import { gql, useQuery, useLazyQuery } from '@apollo/client';
import type {
  GqlAPIQueryResponse,
  GqlAPIQueryRequest,
  GqlAPILazyQueryResponse,
  GqlAPILazyQueryRequest
} from '@api/types';

export interface ExperimentRequest {
  category: string;
  experimentName: string;
  hubID: string;
}

export interface GetChaosFaultRequest {
  projectID: string;
  request: ExperimentRequest;
}

export interface FaultDetails {
  fault: string;
  engine: string;
  csv: string;
}

export interface GetChaosFaultResponse {
  getChaosFault: FaultDetails;
}

export function getChaosFault({
  projectID,
  // Params
  request,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetChaosFaultResponse, GetChaosFaultRequest>): GqlAPIQueryResponse<
  GetChaosFaultResponse,
  GetChaosFaultRequest
> {
  const { data, loading, ...rest } = useQuery<GetChaosFaultResponse, GetChaosFaultRequest>(
    gql`
      query getChaosFault($request: ExperimentRequest!, $projectID: ID!) {
        getChaosFault(request: $request, projectID: $projectID) {
          fault
          engine
          csv
        }
      }
    `,
    {
      variables: {
        projectID,
        request
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

export function getChaosFaultLazyQuery({
  ...options
}: GqlAPILazyQueryRequest<GetChaosFaultResponse, GetChaosFaultRequest>): GqlAPILazyQueryResponse<
  GetChaosFaultResponse,
  GetChaosFaultRequest
> {
  const [getChaosFaultQuery, result] = useLazyQuery<GetChaosFaultResponse, GetChaosFaultRequest>(
    gql`
      query getChaosFault($request: ExperimentRequest!, $projectID: ID!) {
        getChaosFault(request: $request, projectID: $projectID) {
          fault
          engine
          csv
        }
      }
    `,
    {
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [getChaosFaultQuery, result];
}
