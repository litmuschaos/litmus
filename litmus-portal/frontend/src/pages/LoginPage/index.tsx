import { Typography } from '@material-ui/core';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useState } from 'react';
import Loader from '../../components/Loader';
import config from '../../config';
import Center from '../../containers/layouts/Center';
import { setUserDetails } from '../../utils/auth';
import { validateStartEmptySpacing } from '../../utils/validate';
import useStyles from './styles';

interface authData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const classes = useStyles();

  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authData, setAuthData] = useState<authData>({
    username: '',
    password: '',
  });

  const responseCode = 200;
  const loaderSize = 20;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    fetch(`${config.auth.url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authData),
    })
      .then((response) => {
        if (response.status !== responseCode) {
          setIsError(true);
          setIsLoading(false);
        } else {
          setIsError(false);
        }
        return response.json();
      })
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          setUserDetails(data.access_token);
          setIsLoading(false);
          window.location.assign('/getStarted');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className={classes.rootContainer}>
      <Center>
        <div className={classes.rootDiv}>
          <div>
            <img src="icons/LitmusLogoLight.svg" alt="litmus logo" />
            {/* TODO: Add translations */}
            <Typography className={classes.HeaderText}>
              One-stop-shop for Chaos Engineering on kubernetes
            </Typography>
            <Typography className={classes.litmusText}>
              Browse, create, manage monitor and analyze your chaos workflows
            </Typography>
          </div>
          <form
            id="login-form"
            autoComplete="on"
            onSubmit={handleSubmit}
            className={classes.inputDiv}
          >
            <div>
              <InputField
                className={classes.inputValue}
                label="Username"
                value={authData.username}
                helperText={
                  validateStartEmptySpacing(authData.username)
                    ? 'Should not start with an empty space'
                    : ''
                }
                variant={
                  validateStartEmptySpacing(authData.username)
                    ? 'error'
                    : 'primary'
                }
                required
                onChange={(e) =>
                  setAuthData({
                    username: e.target.value,
                    password: authData.password,
                  })
                }
              />
              <InputField
                className={classes.inputValue}
                label="Password"
                type="password"
                required
                value={authData.password}
                helperText={
                  isError
                    ? 'Wrong Credentials - Try again with correct username or password'
                    : ''
                }
                variant={isError ? 'error' : 'primary'}
                onChange={(e) =>
                  setAuthData({
                    username: authData.username,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <ButtonFilled
              className={classes.loginButton}
              type="submit"
              disabled={isLoading}
            >
              <div data-cy="loginButton">
                {isLoading ? <Loader size={loaderSize} /> : 'Login'}
              </div>
            </ButtonFilled>
          </form>
        </div>
      </Center>
    </div>
  );
};

export default LoginPage;
