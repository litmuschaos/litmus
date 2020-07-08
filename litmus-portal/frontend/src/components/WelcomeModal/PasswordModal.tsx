import React from 'react';
import { Paper, TextField } from '@material-ui/core';
import useStyles from './styles';

function Icon() {
  const classes = useStyles();
  return (
    <img src="icons/LitmusLogo.png" className={classes.mark} alt="markLitmus" />
  );
}

function PasswordModal() {
  const classes = useStyles();
  return (
    <div>
      <Icon />
      <div className={classes.newc}>
        Welcome to Litmus Portal,
        <br />
        {/* Pass here corrosponding name of user */}
        <strong> Administrator ! </strong>
      </div>
      <div className={classes.text2}>
        Set your new password <br />
        <Paper className={classes.inputArea}>
          <TextField
            id="filled-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            InputProps={{ disableUnderline: true }}
            data-cy="inputProjectPassword"
          />
        </Paper>
      </div>
    </div>
  );
}
export default PasswordModal;
