import { Typography, Paper, TextField, Hidden } from '@material-ui/core';
import { Link } from 'react-router-dom';
import React from 'react';
import ButtonFilled from '../../components/ButtonFilled/index';
import useStyles from './styles';

const LoginPage = () => {
  const classes = useStyles();
  return (
    <div className={classes.rootContainer}>
      <div className={classes.root}>
        <div className={classes.rootDiv}>
          <div className={classes.mainDiv}>
            <img src="icons/LitmusLogo.png" alt="litmus logo" />
            <Typography variant="h2" className={classes.heading}>
              Welcome to <strong>Litmus</strong>
            </Typography>
            <Typography className={classes.description}>
              {' '}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua
            </Typography>
            <div className={classes.inputDiv}>
              <Paper className={classes.inputArea}>
                <TextField
                  id="filled-email-input"
                  label="Email Address"
                  InputProps={{ disableUnderline: true }}
                  data-cy="inputEmail"
                />
              </Paper>
              <Paper className={classes.inputArea}>
                <TextField
                  id="filled-password-input"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  InputProps={{ disableUnderline: true }}
                  data-cy="inputPassword"
                />
              </Paper>

              <Typography className={classes.forgotPasssword}>
                <Link
                  to="/reset"
                  className={classes.linkForgotPass}
                  data-cy="forgotPassword"
                >
                  Don’t remember your password?
                </Link>
              </Typography>
              <div className={classes.loginDiv} data-cy="loginButton">
                <ButtonFilled handleClick={() => {}} value="Login" />
              </div>
            </div>
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
