/* eslint-disable react/no-danger */
import { Typography } from '@material-ui/core';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import config from '../../config';
import { setUserDetails } from '../../utils/auth';
import { validateStartEmptySpacing } from '../../utils/validate';
import useStyles from './styles';

interface authData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const { t } = useTranslation();
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
          // TODO: react-router generate experiment
          window.location.assign('/home');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className={classes.rootContainer}>
      <div className={classes.mainDiv}>
        <div className={classes.box}>
          <img src="icons/LitmusLogo.svg" alt="litmus logo" />
          <Typography variant="h2" className={classes.heading}>
            <div dangerouslySetInnerHTML={{ __html: t('login.heading') }} />
          </Typography>
          <Typography className={classes.description} gutterBottom>
            {t('login.subHeading1')}
            <img
              src="icons/kubernetes.png"
              alt="Kubernetes"
              className={classes.descImg}
            />
            {t('login.subHeading2')}
            <br />
          </Typography>
          <Typography className={classes.description}>
            {t('login.subHeading3')}
          </Typography>
          <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
            <div className={classes.inputDiv}>
              <div className={classes.inputValue} data-cy="inputName">
                <InputField
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
              </div>
              <div style={{ margin: '0.4rem 0' }} />
              <div className={classes.inputValue} data-cy="inputPassword">
                <InputField
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
            </div>
            <div className={classes.loginDiv}>
              <ButtonFilled
                className={classes.w20}
                type="submit"
                disabled={isLoading}
              >
                <div data-cy="loginButton">
                  {isLoading ? <Loader size={loaderSize} /> : 'Login'}
                </div>
              </ButtonFilled>
            </div>
          </form>
        </div>
      </div>

      <div className={classes.imageDiv}>
        <img
          src="/icons/login.svg"
          alt="Login screen"
          className={classes.loginImage}
        />
      </div>
    </div>
  );
};

export default LoginPage;
