import { Button, Hidden, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config';
import useActions from '../../redux/actions';
import * as UserActions from '../../redux/actions/user';
import { history } from '../../redux/configureStore';
import useStyles from './styles';
import InputField from '../../components/InputField';

interface authData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const user = useActions(UserActions);
  const classes = useStyles();
  const [authData, setAuthData] = useState<authData>({
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState<boolean>(false);
  const handleForm = () => {
    const formData: HTMLFormElement | null = document.querySelector(
      '#login-form'
    );
    const data = new FormData(formData as HTMLFormElement);
    const username = data.get('username') as string;
    const password = data.get('password') as string;
    const searchParams = new URLSearchParams();
    searchParams.append('username', username);
    searchParams.append('password', password);
    fetch(`${config.auth.url}/login`, {
      method: 'POST',
      body: searchParams,
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          setFormError(true);
        } else {
          user.setUserDetails(data.access_token);
          setFormError(false);
          history.push('/');
        }
      })
      .catch((err) => {
        setFormError(true);
        console.error(err);
      });
  };

  return (
    <div className={classes.rootContainer}>
      <div className={classes.root}>
        <div className={classes.rootDiv}>
          <div className={classes.mainDiv}>
            <img src="icons/LitmusLogo.png" alt="litmus logo" />
            <Typography variant="h2" className={classes.heading}>
              Welcome to <strong>Litmus!</strong>
            </Typography>
            <Typography className={classes.description} gutterBottom>
              Your one-stop-shop for Chaos Engineering on
              <img
                src="icons/kubernetes.png"
                alt="Kubernetes"
                className={classes.descImg}
              />
              . Browse, create, manage, monitor and analyze your chaos
              workflows.
              <br />
            </Typography>
            <Typography className={classes.description}>
              With your own private ChaosHub, you can create your new chaos
              experiments and share them with your team.
            </Typography>
            <form
              id="login-form"
              className={classes.root}
              autoComplete="on"
              onSubmit={(event) => {
                event.preventDefault();
                handleForm();
              }}
            >
              <div className={classes.inputDiv}>
                <InputField
                  label="Username"
                  name="username"
                  value={authData.username}
                  data-cy="inputEmail"
                  required
                  formError={formError}
                  handleChange={(e) =>
                    setAuthData({
                      username: e.target.value,
                      password: authData.password,
                    })
                  }
                />
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  required
                  formError={formError}
                  value={authData.password}
                  data-cy="inputPassword"
                  handleChange={(e) =>
                    setAuthData({
                      username: authData.username,
                      password: e.target.value,
                    })
                  }
                />
                <Typography className={classes.forgotPasssword}>
                  <Link
                    to="/reset"
                    className={classes.linkForgotPass}
                    data-cy="forgotPassword"
                  >
                    Don’t remember your password?
                  </Link>
                </Typography>
                <div className={classes.loginDiv}>
                  <Button
                    type="submit"
                    className={classes.submitButton}
                    data-cy="loginButton"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <Hidden mdDown>
          <div className={classes.imageDiv}>
            <img src="/icons/LoginScreen.png" alt="Login screen" />
          </div>
        </Hidden>
      </div>
    </div>
  );
};

export default LoginPage;
