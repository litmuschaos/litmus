import React from 'react';
import { Paper, TextField } from '@material-ui/core';
import useStyles from './styles';

/* Modal is taking input for Name of user */
function Icon() {
  const classes = useStyles();
  return (
    <img src="icons/LitmusLogo.png" className={classes.mark} alt="markLitmus" />
  );
}

function NamingModal() {
  const classes = useStyles();
  return (
    <div>
      <Icon />
      <div className={classes.heading}>
        Welcome to Litmus Portal,
        <br />
        {/* Pass here corrosponding name of user */}
        <strong> Administrator ! </strong>
      </div>
      <div className={classes.infoHeading}>
        How to contact you? <br />
        <Paper className={classes.inputArea}>
          <TextField
            id="filled-name-input"
            label="Full Name"
            InputProps={{ disableUnderline: true }}
            data-cy="inputProjectName"
          />
        </Paper>
      </div>
    </div>
  );
}
export default NamingModal;
