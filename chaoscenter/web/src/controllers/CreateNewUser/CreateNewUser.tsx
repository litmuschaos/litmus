import React from 'react';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useToaster } from '@harnessio/uicore';
import CreateNewUserView from '@views/CreateNewUser';
import { useCreateUserMutation, Users } from '@api/auth';
import { useStrings } from '@strings';

interface CreateNewUserControllerProps {
  getUsersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Users, unknown>>;
  handleClose: () => void;
}

export default function CreateNewUserController(props: CreateNewUserControllerProps): React.ReactElement {
  const { getUsersRefetch, handleClose } = props;
  const { showSuccess, showError } = useToaster();
  const { getString } = useStrings();

  const { mutate: createNewUserMutation, isLoading } = useCreateUserMutation(
    {},
    {
      onSuccess: data => {
        getUsersRefetch();
        handleClose();
        showSuccess(getString('userCreateSuccessMessage', { name: data.name }));
      },
      onError: e => {
        showError(e.errorDescription);
      }
    }
  );

  return (
    <CreateNewUserView
      createNewUserMutation={createNewUserMutation}
      createNewUserMutationLoading={isLoading}
      handleClose={handleClose}
    />
  );
}
