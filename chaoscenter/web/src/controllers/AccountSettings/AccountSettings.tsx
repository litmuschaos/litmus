import React from 'react';
import { useParams } from 'react-router-dom';
import AccountSettingsView from '@views/AccountSettings';
import { useGetUserQuery } from '@api/auth';

export default function AccountSettingsController(): React.ReactElement {
  const { accountID } = useParams<{ accountID: string }>();

  const {
    data,
    isLoading,
    refetch: userAccountDetailsRefetch
  } = useGetUserQuery({
    user_id: accountID
  });

  return (
    <AccountSettingsView
      userAccountDetails={data}
      userAccountDetailsRefetch={userAccountDetailsRefetch}
      loading={{
        getUser: isLoading
      }}
    />
  );
}
