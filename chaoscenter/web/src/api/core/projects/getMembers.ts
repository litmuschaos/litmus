import type { Members } from '@api/entities/project';
import useRequest from '@api/useRequest';
import config from '@config';
import type { RestAPIResponse } from '@api/types';

interface MembersResponse {
  data: Members[];
}
export function getActiveMembers(projectID: string): RestAPIResponse<MembersResponse> {
  const { data, error, loading } = useRequest<MembersResponse>({
    baseURL: config.restEndpoints?.authUri,
    url: `/get_project_members/${projectID}/accepted`,
    method: 'GET'
  });
  return { data, error, loading };
}
