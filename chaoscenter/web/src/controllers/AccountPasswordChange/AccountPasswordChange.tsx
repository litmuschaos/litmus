import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useHistory } from 'react-router-dom';
import { useUpdatePasswordMutation } from '@api/auth';
import AccountPasswordChangeView from '@views/AccountPasswordChange';
import { useLogout, useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import { setUserDetails } from '@utils';

interface AccountPasswordChangeViewProps {
  handleClose: () => void;
  username: string | undefined;
  initialMode?: boolean;
}

export default function AccountPasswordChangeController(props: AccountPasswordChangeViewProps): React.ReactElement {
  const { handleClose, username, initialMode } = props;
  const { showSuccess } = useToaster();
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { forceLogout } = useLogout();

  const { mutate: updatePasswordMutation, isLoading } = useUpdatePasswordMutation(
    {},
    {
      onSuccess: data => {
        setUserDetails({ isInitialLogin: false });
        if (initialMode) {
          history.push(paths.toDashboard());
        } else {
          showSuccess(`${data.message}, ${getString('loginToContinue')}`);
          forceLogout();
        }
      }
    }
  );

  return (
    <AccountPasswordChangeView
      handleClose={handleClose}
      updatePasswordMutation={updatePasswordMutation}
      updatePasswordMutationLoading={isLoading}
      username={username}
      initialMode={initialMode}
    />
  );
}
