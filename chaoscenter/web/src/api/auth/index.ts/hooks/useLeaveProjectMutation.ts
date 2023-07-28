/* eslint-disable */
// This code is autogenerated using @harnessio/oats-cli.
// Please do not modify this code directly.
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { fetcher, FetcherOptions } from 'services/fetcher';

export type LeaveProjectRequestBody = {
  projectID?: string;
  required?: {};
  userID?: string;
};

export type LeaveProjectOkResponse = {
  message?: string;
};

export type LeaveProjectErrorResponse = unknown;

export interface LeaveProjectProps extends Omit<FetcherOptions<unknown, LeaveProjectRequestBody>, 'url'> {
  body: LeaveProjectRequestBody;
}

export function leaveProject(props: LeaveProjectProps): Promise<LeaveProjectOkResponse> {
  return fetcher<LeaveProjectOkResponse, unknown, LeaveProjectRequestBody>({
    url: `auth/leave_project`,
    method: 'POST',
    ...props
  });
}

export type LeaveProjectMutationProps<T extends keyof LeaveProjectProps> = Omit<LeaveProjectProps, T> &
  Partial<Pick<LeaveProjectProps, T>>;

/**
 * This API is used to leave a project
 */
export function useLeaveProjectMutation<T extends keyof LeaveProjectProps>(
  props: Pick<Partial<LeaveProjectProps>, T>,
  options?: Omit<
    UseMutationOptions<LeaveProjectOkResponse, LeaveProjectErrorResponse, LeaveProjectMutationProps<T>>,
    'mutationKey' | 'mutationFn'
  >
) {
  return useMutation<LeaveProjectOkResponse, LeaveProjectErrorResponse, LeaveProjectMutationProps<T>>(
    (mutateProps: LeaveProjectMutationProps<T>) => leaveProject({ ...props, ...mutateProps } as LeaveProjectProps),
    options
  );
}
