import React from 'react';
import { useHistory } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import jwtDecode from 'jwt-decode';
import LoginPageView from '@views/Login';
import { useLoginMutation, useGetCapabilitiesQuery, useGetUserQuery } from '@api/auth';
import { getUserDetails, setUserDetails, toTitleCase } from '@utils';
import { normalizePath } from '@routes/RouteDefinitions';
import type { DecodedTokenType, PermissionGroup } from '@models';
import { useSearchParams } from '@hooks';

const LoginController: React.FC = () => {
  const history = useHistory();
  const { showError, clear } = useToaster();
  const searchParams = useSearchParams();

  const dexToken = searchParams.get('jwtToken');
  const dexProjectID = searchParams.get('projectID');
  const dexProjectRole = searchParams.get('projectRole') as PermissionGroup;

  const [activateGetAPI, setActivateGetAPI] = React.useState<boolean>(false);

  const capabilities = useGetCapabilitiesQuery({});

  React.useEffect(() => {
    if (dexToken && dexProjectID && dexProjectRole) {
      const accountID = (jwtDecode(dexToken) as DecodedTokenType).uid;
      setUserDetails({
        accessToken: dexToken,
        projectID: dexProjectID,
        projectRole: dexProjectRole ?? ''
      });
      if (dexProjectID && dexProjectID.trim() !== '') {
        history.push(normalizePath(`/account/${accountID}/project/${dexProjectID}/dashboard`));
      } else {
        history.push(normalizePath(`/account/${accountID}/settings/projects`));
      }
    }
  }, []);

  const { isLoading, mutate: handleLogin } = useLoginMutation(
    {},
    {
      onError: err => {
        clear();
        showError(
          toTitleCase({
            separator: '_',
            text: err.error ?? ''
          })
        );
      },
      onSuccess: response => {
        if (response.accessToken) {
          setUserDetails(response);
          setActivateGetAPI(true);
        }
      },
      retry: false
    }
  );

  const userDetails = getUserDetails();

  useGetUserQuery(
    {
      user_id: userDetails.accountID
    },
    {
      enabled: activateGetAPI,
      onSuccess: response => {
        setUserDetails({
          isInitialLogin: response.isInitialLogin
        });
        if (response.isInitialLogin) {
          history.push(`/account/${userDetails.accountID}/settings/password-reset`);
        } else if (userDetails.projectID && userDetails.projectID.trim() !== '') {
          history.push(normalizePath(`/account/${userDetails.accountID}/project/${userDetails.projectID}/dashboard`));
        } else {
          history.push(normalizePath(`/account/${userDetails.accountID}/settings/projects`));
        }
      }
    }
  );

  return <LoginPageView handleLogin={handleLogin} loading={isLoading} capabilities={capabilities.data} />;
};

export default LoginController;
