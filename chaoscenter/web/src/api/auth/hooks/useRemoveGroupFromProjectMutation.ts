import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import { fetcher, FetcherOptions } from 'services/fetcher';

export type RemoveGroupFromProjectRequestBody = {
  projectID: string;
  group: string;
};

export type RemoveGroupFromProjectOkResponse = {
  message?: string;
};

export type RemoveGroupFromProjectErrorResponse = unknown;

export interface RemoveGroupFromProjectProps
  extends Omit<FetcherOptions<unknown, RemoveGroupFromProjectRequestBody>, 'url'> {
  body: RemoveGroupFromProjectRequestBody;
}

export function removeGroupFromProject(props: RemoveGroupFromProjectProps): Promise<RemoveGroupFromProjectOkResponse> {
  return fetcher<RemoveGroupFromProjectOkResponse, unknown, RemoveGroupFromProjectRequestBody>({
    url: `/auth/remove_group_from_project`,
    method: 'POST',
    ...props
  });
}

export type RemoveGroupFromProjectMutationProps<T extends keyof RemoveGroupFromProjectProps> = Omit<
  RemoveGroupFromProjectProps,
  T
> &
  Partial<Pick<RemoveGroupFromProjectProps, T>>;

/**
 * This API is used to remove an OIDC group from a project
 */
export function useRemoveGroupFromProjectMutation<T extends keyof RemoveGroupFromProjectProps>(
  props: Pick<Partial<RemoveGroupFromProjectProps>, T>,
  options?: Omit<
    UseMutationOptions<
      RemoveGroupFromProjectOkResponse,
      RemoveGroupFromProjectErrorResponse,
      RemoveGroupFromProjectMutationProps<T>
    >,
    'mutationKey' | 'mutationFn'
  >
): UseMutationResult<
  RemoveGroupFromProjectOkResponse,
  RemoveGroupFromProjectErrorResponse,
  RemoveGroupFromProjectMutationProps<T>
> {
  return useMutation<
    RemoveGroupFromProjectOkResponse,
    RemoveGroupFromProjectErrorResponse,
    RemoveGroupFromProjectMutationProps<T>
  >(
    (mutateProps: RemoveGroupFromProjectMutationProps<T>) =>
      removeGroupFromProject({ ...props, ...mutateProps } as RemoveGroupFromProjectProps),
    options
  );
}
