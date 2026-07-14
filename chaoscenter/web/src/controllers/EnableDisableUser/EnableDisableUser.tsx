import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import EnableDisableUserView from '@views/EnableDisableUser';
import { Users, useUpdateStateMutation } from '@api/auth';

interface EnableDisableUserControllerProps {
  handleClose: () => void;
  currentState: boolean | undefined;
  username: string | undefined;
  getUsersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Users, unknown>>;
}

export default function EnableDisableUserController(props: EnableDisableUserControllerProps): React.ReactElement {
  const { getUsersRefetch } = props;
  const { showSuccess } = useToaster();

  const { mutate: updateStateMutation, isLoading: updateStateMutationLoading } = useUpdateStateMutation(
    {},
    {
      onSuccess: data => {
        getUsersRefetch();
        showSuccess(data.message);
      }
    }
  );

  return (
    <EnableDisableUserView
      {...props}
      updateStateMutation={updateStateMutation}
      updateStateMutationLoading={updateStateMutationLoading}
    />
  );
}
