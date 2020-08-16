import { Button, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';
import Unimodal from '../../../Unimodal';

interface PasswordModalProps {
  formErr: boolean;
  isEmpty: boolean;
}

// Displays the modal after the password is changed
const PasswordModal: React.FC<PasswordModalProps> = ({ formErr, isEmpty }) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        data-cy="button"
        variant="contained"
        className={classes.button}
        onClick={() => {
          if (!formErr && !isEmpty) {
            setOpen(true);
          }
        }}
      >
        Change password
      </Button>
      <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
        <div className={classes.body}>
          <img src="./icons/lock.svg" alt="lock" />
          <div className={classes.text}>
            <Typography className={classes.typo} align="center">
              Your password <strong>has been changed!</strong>
            </Typography>
          </div>
          <div className={classes.text1}>
            <Typography className={classes.typo1}>
              You can now use your new password to login to your account
            </Typography>
          </div>
          <Button
            data-cy="closeButton"
            variant="contained"
            className={classes.button}
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      </Unimodal>
    </div>
  );
};
export default PasswordModal;
