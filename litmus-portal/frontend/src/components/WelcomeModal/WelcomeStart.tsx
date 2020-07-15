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
const WelcomeStart: React.FC<ModalData> = ({ setData }) => {
  const classes = useStyles();
  return (
    <div>
      <div>
        <Icon />
      </div>
      <div className={classes.heading}>
        Welcome to Litmus Portal,
        <br />
        {/* Pass here corrosponding name of user */}
        <strong> Administrator ! </strong>
      </div>
      <div className={classes.infoHeading}>
        To get started, enter the name of your first project. <br />
        <Paper className={classes.inputArea}>
          <TextField
            id="filled-email-input"
            label="Full Name"
            InputProps={{ disableUnderline: true }}
            data-cy="inputProjectEmail"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setData('name', event.target.value);
            }}
          />
        </Paper>
      </div>
    </div>
  );
};
export default WelcomeStart;
