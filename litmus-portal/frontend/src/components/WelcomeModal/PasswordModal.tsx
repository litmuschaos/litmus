import React from 'react';
import { Paper, TextField } from '@material-ui/core';
import useStyles from './styles';

function Icon() {
  const classes = useStyles();
  return (
    <img src="icons/LitmusLogo.png" className={classes.mark} alt="markLitmus" />
  );
}
interface ModalData {
  setData: Function;
}
/* This is main page to take input for Project */
const PasswordModal: React.FC<ModalData> = ({ setData }) => {
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
        Set your new password <br />
        <Paper className={classes.inputArea}>
          <TextField
            id="filled-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            InputProps={{ disableUnderline: true }}
            data-cy="inputProjectPassword"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setData('password', event.target.value);
            }}
          />
        </Paper>
      </div>
    </div>
  );
};
export default PasswordModal;
