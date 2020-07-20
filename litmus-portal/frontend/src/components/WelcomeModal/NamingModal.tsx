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
interface ModalData {
  setData: Function;
}
/* This is main page to take input for Project */
const NamingModal: React.FC<ModalData> = ({ setData }) => {
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
            label="Email Address"
            InputProps={{ disableUnderline: true }}
            data-cy="inputProjectName"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setData('email', event.target.value);
            }}
          />
        </Paper>
      </div>
    </div>
  );
};
export default NamingModal;
