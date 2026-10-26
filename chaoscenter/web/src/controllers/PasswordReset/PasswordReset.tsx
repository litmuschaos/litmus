import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useHistory } from 'react-router-dom';
import PasswordResetView from '@views/PasswordReset';
import { useGetUserQuery, useUpdatePasswordMutation } from '@api/auth';
import { getUserDetails, setUserDetails } from '@utils';
import { normalizePath } from '@routes/RouteDefinitions';
import { useAppStore } from '@context';

const PasswordResetController = (): React.ReactElement => {
  const { accountID } = getUserDetails();
  const { showSuccess, showError } = useToaster();
  const history = useHistory();
  const { updateAppStore } = useAppStore();

  const { data: currentUserData, isLoading: getUserLoading } = useGetUserQuery(
    {
      user_id: accountID
    },
    {
      enabled: !!accountID
    }
  );

  const { mutate: updatePasswordMutation, isLoading: updatePasswordLoading } = useUpdatePasswordMutation(
    {},
    {
      onSuccess: data => {
        setUserDetails({ isInitialLogin: false });
        showSuccess(`${data.message}`);
        updateAppStore({ projectID: data.projectID });
        history.push(normalizePath(`/account/${accountID}/project/${data.projectID}/dashboard`));
      },
      onError: err => showError(err.errorDescription)
    }
  );

  return (
    <PasswordResetView
      currentUserData={currentUserData}
      updatePasswordMutation={updatePasswordMutation}
      loading={{
        getUser: getUserLoading,
        updatePassword: updatePasswordLoading
      }}
    />
  );
};

export default PasswordResetController;
