import React from 'react';
import { Paper, TextField } from '@material-ui/core';
import useStyles from './styles';

function Icon() {
  const classes = useStyles();
  return (
    <img src="icons/LitmusLogo.png" className={classes.mark} alt="markLitmus" />
  );
}

/* This is main page to take input for Project */

function WelcomeStart() {
  const classes = useStyles();
  return (
    <div>
      <div>
        <Icon />
      </div>
      <div className={classes.newc}>
        Welcome to Litmus Portal,
        <br />
        {/* Pass here corrosponding name of user */}
        <strong> Administrator ! </strong>
      </div>
      <div className={classes.text2}>
        To get started, enter the name of your first project. <br />
        <Paper className={classes.inputArea}>
          <TextField
            id="filled-email-input"
            label="Email Address"
            InputProps={{ disableUnderline: true }}
            data-cy="inputProjectEmail"
          />
        </Paper>
      </div>
    </div>
  );
}
export default WelcomeStart;
