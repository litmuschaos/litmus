import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import jwtDecode from 'jwt-decode';
import config from '@config';
import { setUserDetails } from '@utils';
import { paths } from '@routes/RouteDefinitions';
import LoginPageView from '@views/Login';
import type { DecodedTokenType } from 'app/App';

interface LoginForm {
  username: string;
  password: string;
}

const LoginController: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { showError } = useToaster();

  const handleLogin = async (data: LoginForm): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${config.restEndpoints.authUri}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setLoading(false);
      if (response.ok) {
        const json = await response.json();
        const accountID = (jwtDecode(json.access_token) as DecodedTokenType).uid;
        setUserDetails({
          token: json.access_token,
          projectID: json.project_id,
          role: json.project_role,
          accountID: accountID
        });
        history.push(`/account/${accountID}/project/${json.project_id}${paths.toDashboard()}`);
      } else {
        throw response;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLoading(false);
      showError(e?.statusText);
    }
  };

  const handleSubmit = (data: LoginForm): void => {
    handleLogin(data);
  };

  return <LoginPageView handleSubmit={handleSubmit} loading={loading} />;
};

export default LoginController;
