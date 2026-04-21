import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import { fetcher, FetcherOptions } from 'services/fetcher';

export type UpdateGroupRoleRequestBody = {
  projectID: string;
  group: string;
  role: 'Executor' | 'Owner' | 'Viewer';
};

export type UpdateGroupRoleOkResponse = {
  message?: string;
};

export type UpdateGroupRoleErrorResponse = unknown;

export interface UpdateGroupRoleProps extends Omit<FetcherOptions<unknown, UpdateGroupRoleRequestBody>, 'url'> {
  body: UpdateGroupRoleRequestBody;
}

export function updateGroupRole(props: UpdateGroupRoleProps): Promise<UpdateGroupRoleOkResponse> {
  return fetcher<UpdateGroupRoleOkResponse, unknown, UpdateGroupRoleRequestBody>({
    url: `/auth/update_group_role`,
    method: 'POST',
    ...props
  });
}

export type UpdateGroupRoleMutationProps<T extends keyof UpdateGroupRoleProps> = Omit<UpdateGroupRoleProps, T> &
  Partial<Pick<UpdateGroupRoleProps, T>>;

/**
 * This API is used to update the role of an OIDC group in a project
 */
export function useUpdateGroupRoleMutation<T extends keyof UpdateGroupRoleProps>(
  props: Pick<Partial<UpdateGroupRoleProps>, T>,
  options?: Omit<
    UseMutationOptions<UpdateGroupRoleOkResponse, UpdateGroupRoleErrorResponse, UpdateGroupRoleMutationProps<T>>,
    'mutationKey' | 'mutationFn'
  >
): UseMutationResult<UpdateGroupRoleOkResponse, UpdateGroupRoleErrorResponse, UpdateGroupRoleMutationProps<T>> {
  return useMutation<UpdateGroupRoleOkResponse, UpdateGroupRoleErrorResponse, UpdateGroupRoleMutationProps<T>>(
    (mutateProps: UpdateGroupRoleMutationProps<T>) =>
      updateGroupRole({ ...props, ...mutateProps } as UpdateGroupRoleProps),
    options
  );
}
