import { Tooltip, Typography } from '@material-ui/core';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
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
          setErrorMsg('');
        }
        return response.json();
      })
      .then((data) => {
        if ('error' in data) {
          setErrorMsg(data.error);
        } else {
          setErrorMsg('');
          setUserDetails(data.access_token);
          setIsLoading(false);
          window.location.assign(`${process.env.PUBLIC_URL}/getStarted`);
        }
      })
      .catch((err) => {
        setErrorMsg(err.error);
      });
  };
  return (
    <div className={classes.rootContainer}>
      <Center>
        <div className={classes.rootDiv}>
          <div>
            <img src="./icons/LitmusLogoLight.svg" alt="litmus logo" />
            <Typography className={classes.HeaderText}>
              {t('login.heading')}
            </Typography>
            <Typography className={classes.litmusText}>
              {t('login.subHeading1')}
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
                data-cy="inputName"
                className={classes.inputValue}
                label="Username"
                value={authData.username}
                helperText={
                  validateStartEmptySpacing(authData.username)
                    ? t(
                        'settings.userManagementTab.createUser.userDetails.validationEmptySpace'
                      )
                    : ''
                }
                filled
                onChange={(e) =>
                  setAuthData({
                    username: e.target.value,
                    password: authData.password,
                  })
                }
              />
              <InputField
                data-cy="inputPassword"
                className={classes.inputValue}
                label="Password"
                type="password"
                required
                value={authData.password}
                helperText={isError ? errorMsg : ''}
                filled
                onChange={(e) =>
                  setAuthData({
                    username: authData.username,
                    password: e.target.value,
                  })
                }
              />
            </div>
            <div className={classes.buttonGroup}>
              <ButtonFilled
                className={classes.loginButton}
                type="submit"
                disabled={isLoading}
              >
                <div data-cy="loginButton">
                  {isLoading ? <Loader size={loaderSize} /> : 'Login'}
                </div>
              </ButtonFilled>
              <Tooltip
                classes={{
                  tooltip: classes.tooltip,
                }}
                disableFocusListener
                placement="bottom"
                title={<Typography>{t('login.tooltipText')}</Typography>}
              >
                <Typography className={classes.forgetPwdText}>
                  {t('login.forgetPassword')}
                </Typography>
              </Tooltip>
            </div>
          </form>
        </div>
      </Center>
    </div>
  );
};

export default LoginPage;
