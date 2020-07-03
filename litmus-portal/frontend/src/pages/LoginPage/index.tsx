import { Hidden, Paper, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import ButtonFilled from '../../components/ButtonFilled/index';
import useStyles from './styles';

const LoginPage = () => {
  const classes = useStyles();
  return (
    <div className={classes.rootContainer}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '50%' }}>
          <div className={classes.root}>
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
              <div className={classes.loginDiv}>
                <ButtonFilled
                  handleClick={() => {
                    // console.log('Login Button Clicked');
                  }}
                  value="Login"
                  data-cy="loginButton"
                />
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
