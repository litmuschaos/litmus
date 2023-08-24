import React from 'react';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useToaster } from '@harnessio/uicore';
import AccountNameChangeView from '@views/AccountDetailsChange';
import { User, useUpdateDetailsMutation } from '@api/auth';

interface AccountDetailsChangeControllerProps {
  handleClose: () => void;
  currentUser: User | undefined;
  userAccountDetailsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<User, unknown>>;
}

export default function AccountDetailsChangeController(props: AccountDetailsChangeControllerProps): React.ReactElement {
  const { handleClose, currentUser, userAccountDetailsRefetch } = props;
  const { showSuccess } = useToaster();

  const { mutate: updateDetailsMutation, isLoading } = useUpdateDetailsMutation(
    {},
    {
      onSuccess: data => {
        userAccountDetailsRefetch();
        showSuccess(data.message);
      }
    }
  );

  return (
    <AccountNameChangeView
      handleClose={handleClose}
      currentUser={currentUser}
      updateDetailsMutation={updateDetailsMutation}
      updateDetailsMutationLoading={isLoading}
    />
  );
}
