import useRequest from '@api/useRequest';
import config from '@config';
import type { RestAPIResponse } from '@api/types';
import type { Users } from '@api/entities/users';

export function getUsersForInvitation(projectID: string): RestAPIResponse<Array<Users>> {
  const { data, error, loading } = useRequest<Array<Users>>({
    baseURL: config.restEndpoints?.authUri,
    url: `/invite_users/${projectID}`,
    method: 'GET'
  });
  return { data, error, loading };
}
