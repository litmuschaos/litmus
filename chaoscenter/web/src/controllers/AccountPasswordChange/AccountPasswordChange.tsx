import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useUpdatePasswordMutation } from '@api/auth';
import AccountPasswordChangeView from '@views/AccountPasswordChange';
import { useLogout } from '@hooks';
import { useStrings } from '@strings';
import { setUserDetails } from '@utils';

interface AccountPasswordChangeViewProps {
  handleClose: () => void;
  username: string | undefined;
}

export default function AccountPasswordChangeController(props: AccountPasswordChangeViewProps): React.ReactElement {
  const { handleClose, username } = props;
  const { showSuccess } = useToaster();
  const { getString } = useStrings();
  const { forceLogout } = useLogout();

  const { mutate: updatePasswordMutation, isLoading } = useUpdatePasswordMutation(
    {},
    {
      onSuccess: data => {
        setUserDetails({ isInitialLogin: false });
        showSuccess(`${data.message}, ${getString('loginToContinue')}`);
        forceLogout();
      }
    }
  );

  return (
    <AccountPasswordChangeView
      handleClose={handleClose}
      updatePasswordMutation={updatePasswordMutation}
      updatePasswordMutationLoading={isLoading}
      username={username}
    />
  );
}
