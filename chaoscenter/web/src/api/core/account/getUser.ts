import type { User as GetUserResponse } from '@api/entities';
import type { RestAPIResponse } from '@api/types';
import useRequest from '@api/useRequest';
import config from '@config';

interface GetUserRequest {
  userID: string;
}

export function getUser({ userID }: GetUserRequest): RestAPIResponse<GetUserResponse> {
  const { data, loading, error } = useRequest<GetUserResponse, undefined>({
    baseURL: config.restEndpoints.authUri,
    url: `/getUser/${userID}`,
    method: 'GET'
  });

  return {
    data,
    loading,
    error
  };
}
