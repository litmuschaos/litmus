import React from 'react';
import { useHistory } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import jwtDecode from 'jwt-decode';
import LoginPageView from '@views/Login';
import { useLoginMutation } from '@api/auth';
import { setUserDetails } from '@utils';
import { normalizePath } from '@routes/RouteDefinitions';
import type { DecodedTokenType, PermissionGroup } from '@models';
import { useSearchParams } from '@hooks';

const LoginController: React.FC = () => {
  const history = useHistory();
  const { showError } = useToaster();
  const searchParams = useSearchParams();
  const dexToken = searchParams.get('jwtToken');
  const dexProjectID = searchParams.get('projectID');
  const dexProjectRole = searchParams.get('projectRole') as PermissionGroup;

  React.useEffect(() => {
    if (dexToken && dexProjectID && dexProjectRole) {
      const accountID = (jwtDecode(dexToken) as DecodedTokenType).uid;
      setUserDetails({
        accessToken: dexToken,
        projectID: dexProjectID,
        projectRole: dexProjectRole ?? ''
      });
      history.push(normalizePath(`/account/${accountID}/project/${dexProjectID ?? ''}/dashboard`));
    }
  }, []);

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
