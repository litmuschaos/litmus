import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import React from 'react';
import Lock from '../../../assets/icons/lock.svg';
import useStyles from './styles';

interface PasswordModalProps {
  er2: boolean;
  er3: boolean;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ er2, er3 }) => {
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
          if (!er2 && !er3) {
            setOpen(true);
          }
        }}
      >
        Change password
      </Button>
      <Modal
        data-cy="modal"
        open={open}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
      >
        <div className={classes.paper}>
          <div className={classes.body}>
            <img src={Lock} alt="lock" />
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
        </div>
      </Modal>
    </div>
  );
};
export default PasswordModal;
