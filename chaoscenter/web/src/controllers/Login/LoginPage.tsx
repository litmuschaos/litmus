import React from 'react';
import { useHistory } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import jwtDecode from 'jwt-decode';
import LoginPageView from '@views/Login';
import { useLoginMutation } from '@api/auth';
import { setUserDetails } from '@utils';
import { normalizePath } from '@routes/RouteDefinitions';
import type { DecodedTokenType } from '@models';

const LoginController: React.FC = () => {
  const history = useHistory();
  const { showError } = useToaster();
  const { isLoading, mutate: handleLogin } = useLoginMutation(
    {},
    {
      onError: err => showError(err.error),
      onSuccess: response => {
        if (response.accessToken) {
          const accountID = (jwtDecode(response.accessToken) as DecodedTokenType).uid;
          setUserDetails(response);
          history.push(normalizePath(`/account/${accountID}/project/${response.projectID ?? ''}/dashboard`));
        }
      },
      retry: false
    }
  );

  return <LoginPageView handleLogin={handleLogin} loading={isLoading} />;
};

export default LoginController;
