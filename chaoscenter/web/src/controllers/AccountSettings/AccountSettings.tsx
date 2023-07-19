import React from 'react';
import { useParams } from 'react-router-dom';
import AccountSettingsView from '@views/AccountSettings';
import { getUser } from '@api/core/account';

export default function AccountSettingsController(): React.ReactElement {
  const { accountID } = useParams<{ accountID: string }>();
  const { data, loading } = getUser({ userID: accountID });

  return (
    <AccountSettingsView
      userAccountDetails={data}
      loading={{
        getUser: loading
      }}
    />
  );
}
