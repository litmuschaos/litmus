import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useResetPasswordMutation } from '@api/auth';
import ResetPasswordView from '@views/ResetPassword';
import { useStrings } from '@strings';

interface ResetPasswordControllerProps {
  username: string | undefined;
  handleClose: () => void;
}

export default function ResetPasswordController(props: ResetPasswordControllerProps): React.ReactElement {
  const { username, handleClose } = props;
  const { getString } = useStrings();
  const { showSuccess } = useToaster();
  const { mutate: resetPasswordMutation, isLoading: resetPasswordMutationLoading } = useResetPasswordMutation(
    {},
    { onSuccess: () => showSuccess(getString('passwordResetSuccess')) }
  );

  return (
    <ResetPasswordView
      username={username}
      handleClose={handleClose}
      resetPasswordMutation={resetPasswordMutation}
      resetPasswordMutationLoading={resetPasswordMutationLoading}
    />
  );
}
