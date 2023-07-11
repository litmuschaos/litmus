import useRequest from '@api/useRequest';
import config from '@config';
import type { RestAPIResponse } from '@api/types';
import type { User } from '@api/entities/users';

interface InviteUsersResponse {
  data: User[];
}
export function getUsersForInvitation(projectID: string): RestAPIResponse<Array<User>> {
  const { data, error, loading } = useRequest<Array<User>>({
    baseURL: config.restEndpoints?.authUri,
    url: `/invite_users/${projectID}`,
    method: 'GET'
  });
  return { data, error, loading };
}
