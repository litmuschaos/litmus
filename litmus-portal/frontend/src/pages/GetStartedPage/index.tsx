import { useLazyQuery, useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, InputField, TextButton } from 'litmus-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import config from '../../config';
import Center from '../../containers/layouts/Center';
import { CREATE_PROJECT, CREATE_USER, GET_USER_INFO } from '../../graphql';
import {
  CreateUserData,
  CurrentUserDetails,
  Project,
} from '../../models/graphql/user';
import {
  getToken,
  getUserEmail,
  getUserFullName,
  getUserId,
  getUsername,
  getUserRole,
} from '../../utils/auth';
import { validateConfirmPassword } from '../../utils/validate';
import useStyles from './styles';

interface PasswordReset {
  password: string;
  confirmPassword: string;
}

const GetStarted: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [values, setValues] = React.useState<PasswordReset>({
    password: '',
    confirmPassword: '',
  });
  const isError = useRef(true);
  const isSuccess = useRef(false);
  if (
    values.password.length &&
    values.confirmPassword.length &&
    !validateConfirmPassword(values.password, values.confirmPassword)
  ) {
    isError.current = false;
    isSuccess.current = true;
  } else {
    isError.current = true;
    isSuccess.current = false;
  }
  const username = getUsername();

  const [loading, setIsLoading] = useState<boolean>(false);

  // Mutation to create project for a user
  const [CreateProject] = useMutation<Project>(CREATE_PROJECT, {
    onCompleted: () => {
      setIsLoading(false);
      window.location.assign(`${process.env.PUBLIC_URL}/home`);
    },
  });

  // Mutation to create a user in litmusDB
  const [CreateUser] = useMutation<CreateUserData>(CREATE_USER, {
    onCompleted: () => {
      CreateProject({
        variables: {
          projectName: `${username}'s project`,
        },
      });
    },
  });

  // Query to fetch user details of user from litmusDB
  const [getUserInfo] = useLazyQuery<CurrentUserDetails>(GET_USER_INFO, {
    variables: { username },
    // Adding the user to litmusDB if user does not exists
    onError: (err) => {
      if (err.message === 'mongo: no documents in result')
        CreateUser({
          variables: {
            user: {
              username,
              email: getUserEmail(),
              name: getUserFullName(),
              role: getUserRole(),
              userID: getUserId(),
            },
          },
        });
      else console.error(err.message);
    },
    // Creating project for the user
    onCompleted: () => {
      CreateProject({
        variables: {
          projectName: `${username}'s project`,
        },
      });
    },
  });

  // Submit entered data to /update endpoint
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username,
        email: getUserEmail(),
        name: getUserFullName(),
        password: values.password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          isError.current = true;
        } else {
          getUserInfo();
        }
      })
      .catch((err) => {
        isError.current = true;
        console.error(err);
      });
  };

  const loaderSize = 20;

  return (
    <div className={classes.rootContainer}>
      <Center>
        <div className={classes.rootDiv}>
          <div className={classes.rootLitmusText}>
            <img src="./icons/LitmusLogoLight.svg" alt="litmus logo" />
            <Typography className={classes.HeaderText}>
              {' '}
              {t('getStarted.welcome')} {username}!
            </Typography>
            <Typography className={classes.HeaderText}>
              {t('getStarted.password.info')}
            </Typography>
            <Typography className={classes.litmusText}>
              {t('getStarted.password.desc')}
            </Typography>
          </div>
          <form
            id="login-form"
            className={classes.inputDiv}
            onSubmit={handleSubmit}
          >
            <InputField
              data-cy="inputPassword"
              className={classes.inputValue}
              label={t('getStarted.password.label')}
              type="password"
              filled
              required
              value={values.password}
              onChange={(event) => {
                setValues({
                  password: event.target.value,
                  confirmPassword: values.confirmPassword,
                });
              }}
            />
            <InputField
              data-cy="confirmInputPassword"
              className={classes.inputValue}
              label={t('getStarted.password.cnfLabel')}
              type="password"
              required
              value={values.confirmPassword}
              helperText={
                validateConfirmPassword(values.password, values.confirmPassword)
                  ? t('settings.accountsTab.accountsSettings.passwordNotSame')
                  : ''
              }
              filled
              onChange={(event) =>
                setValues({
                  password: values.password,
                  confirmPassword: event.target.value,
                })
              }
            />
            <div className={classes.buttonGroup}>
              <div data-cy="finishButton">
                <ButtonFilled
                  className={classes.submitButton}
                  type="submit"
                  disabled={isError.current}
                >
                  {loading ? (
                    <Loader size={loaderSize} />
                  ) : (
                    <>{t('getStarted.button.finish')}</>
                  )}
                </ButtonFilled>
              </div>
              <div data-cy="skipButton">
                <TextButton
                  className={classes.skipButton}
                  title="Skip for now"
                  variant="highlight"
                  onClick={() => {
                    setIsLoading(true);
                    getUserInfo();
                  }}
                >
                  {loading ? (
                    <Loader size={loaderSize} />
                  ) : (
                    <Typography>{t('getStarted.button.skip')}</Typography>
                  )}
                </TextButton>
              </div>
            </div>
          </form>
        </div>
      </Center>
    </div>
  );
};

export default GetStarted;
