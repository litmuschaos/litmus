/* eslint-disable */
// This code is autogenerated using @harnessio/oats-cli.
// Please do not modify this code directly.
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { fetcher, FetcherOptions } from 'services/fetcher';

export type UpdateDetailsRequestBody = {
  email?: string;
  name?: string;
};

export type UpdateDetailsOkResponse = {
  message?: string;
};

export type UpdateDetailsErrorResponse = unknown;

export interface UpdateDetailsProps extends Omit<FetcherOptions<unknown, UpdateDetailsRequestBody>, 'url'> {
  body: UpdateDetailsRequestBody;
}

export function updateDetails(props: UpdateDetailsProps): Promise<UpdateDetailsOkResponse> {
  return fetcher<UpdateDetailsOkResponse, unknown, UpdateDetailsRequestBody>({
    url: `/auth/update/details`,
    method: 'POST',
    ...props
  });
}

export type UpdateDetailsMutationProps<T extends keyof UpdateDetailsProps> = Omit<UpdateDetailsProps, T> &
  Partial<Pick<UpdateDetailsProps, T>>;

/**
 * This API is used to update the details of a user.
 */
export function useUpdateDetailsMutation<T extends keyof UpdateDetailsProps>(
  props: Pick<Partial<UpdateDetailsProps>, T>,
  options?: Omit<
    UseMutationOptions<UpdateDetailsOkResponse, UpdateDetailsErrorResponse, UpdateDetailsMutationProps<T>>,
    'mutationKey' | 'mutationFn'
  >
) {
  return useMutation<UpdateDetailsOkResponse, UpdateDetailsErrorResponse, UpdateDetailsMutationProps<T>>(
    (mutateProps: UpdateDetailsMutationProps<T>) => updateDetails({ ...props, ...mutateProps } as UpdateDetailsProps),
    options
  );
}
