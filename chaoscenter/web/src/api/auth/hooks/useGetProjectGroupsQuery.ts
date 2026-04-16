import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { fetcher, FetcherOptions } from 'services/fetcher';
import type { GroupMember } from '../schemas/GroupMember';

export interface GetProjectGroupsQueryPathParams {
  project_id: string;
}

export type GetProjectGroupsOkResponse = {
  data?: GroupMember[];
};

export type GetProjectGroupsErrorResponse = unknown;

export interface GetProjectGroupsProps
  extends GetProjectGroupsQueryPathParams,
    Omit<FetcherOptions<unknown, unknown>, 'url'> {}

export function getProjectGroups(props: GetProjectGroupsProps): Promise<GetProjectGroupsOkResponse> {
  return fetcher<GetProjectGroupsOkResponse, unknown, unknown>({
    url: `/auth/get_project_groups/${props.project_id}`,
    method: 'GET',
    ...props
  });
}

/**
 * This API is used to fetch groups assigned to a project
 */
export function useGetProjectGroupsQuery(
  props: GetProjectGroupsProps,
  options?: Omit<UseQueryOptions<GetProjectGroupsOkResponse, GetProjectGroupsErrorResponse>, 'queryKey' | 'queryFn'>
): UseQueryResult<GetProjectGroupsOkResponse, GetProjectGroupsErrorResponse> {
  return useQuery<GetProjectGroupsOkResponse, GetProjectGroupsErrorResponse>(
    ['getProjectGroups', props.project_id],
    ({ signal }) => getProjectGroups({ ...props, signal }),
    options
  );
}
