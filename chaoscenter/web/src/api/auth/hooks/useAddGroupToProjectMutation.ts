import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import { fetcher, FetcherOptions } from 'services/fetcher';
import type { GroupMember } from '../schemas/GroupMember';

export type AddGroupToProjectRequestBody = {
  projectID: string;
  group: string;
  displayName?: string;
  role: 'Executor' | 'Owner' | 'Viewer';
};

export type AddGroupToProjectOkResponse = {
  data?: GroupMember;
};

export type AddGroupToProjectErrorResponse = unknown;

export interface AddGroupToProjectProps extends Omit<FetcherOptions<unknown, AddGroupToProjectRequestBody>, 'url'> {
  body: AddGroupToProjectRequestBody;
}

export function addGroupToProject(props: AddGroupToProjectProps): Promise<AddGroupToProjectOkResponse> {
  return fetcher<AddGroupToProjectOkResponse, unknown, AddGroupToProjectRequestBody>({
    url: `/auth/add_group_to_project`,
    method: 'POST',
    ...props
  });
}

export type AddGroupToProjectMutationProps<T extends keyof AddGroupToProjectProps> = Omit<AddGroupToProjectProps, T> &
  Partial<Pick<AddGroupToProjectProps, T>>;

/**
 * This API is used to assign an OIDC group with a role to a project
 */
export function useAddGroupToProjectMutation<T extends keyof AddGroupToProjectProps>(
  props: Pick<Partial<AddGroupToProjectProps>, T>,
  options?: Omit<
    UseMutationOptions<AddGroupToProjectOkResponse, AddGroupToProjectErrorResponse, AddGroupToProjectMutationProps<T>>,
    'mutationKey' | 'mutationFn'
  >
): UseMutationResult<AddGroupToProjectOkResponse, AddGroupToProjectErrorResponse, AddGroupToProjectMutationProps<T>> {
  return useMutation<AddGroupToProjectOkResponse, AddGroupToProjectErrorResponse, AddGroupToProjectMutationProps<T>>(
    (mutateProps: AddGroupToProjectMutationProps<T>) =>
      addGroupToProject({ ...props, ...mutateProps } as AddGroupToProjectProps),
    options
  );
}
