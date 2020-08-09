import { Button, Modal, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

// props for ResetModal component
interface ResetModalProps {
  resetPossible: boolean;
}

// ResetModal displays modal for resetting the password
const ResetModal: React.FC<ResetModalProps> = ({ resetPossible }) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  // for conditional rendering of second div
  const [showDiv, setShowDiv] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
    setShowDiv(false);
  };
  const handleClick = () => {
    setOpen(true);
  };

  return (
    <div>
      <div>
        <Typography className={classes.resetText}>
          By resetting the password the user needs to re-login into the portal.
          <span
            role="button"
            onClick={handleClick}
            className={classes.resetPass}
            onKeyDown={handleClick}
            tabIndex={0}
          >
            Reset Password of the user
          </span>
        </Typography>

        <Modal
          data-cy="modal"
          open={open}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          className={classes.modal}
        >
          {showDiv ? (
            // Second div
            <div className={classes.paper}>
              <div className={classes.body}>
                <img src="./icons/checkmark.svg" alt="checkmark" />
                <div className={classes.textSucess}>
                  <Typography className={classes.typo} align="center">
                    The user’s password was <strong>successfully reset </strong>
                  </Typography>
                </div>
                <div className={classes.text1Sucess}>
                  <Typography className={classes.typoSub} align="center">
                    The user needs to login with the new credentials. Copy the
                    credentials and share it with the respective user.
                  </Typography>
                </div>
                <div className={classes.copyDiv}>
                  <img src="./icons/copy.svg" alt="copy" />
                  <Typography>Copy the credentials </Typography>
                </div>
                <Button
                  data-cy="closeButton"
                  variant="contained"
                  className={classes.buttonModalSucess}
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            // first div
            <div className={classes.paper}>
              <div className={classes.body}>
                <img src="./icons/lock.svg" alt="lock" />
                <div className={classes.text}>
                  <Typography className={classes.typo} align="center">
                    Are you sure to reset the
                    <strong> password of the current user?</strong>
                  </Typography>
                </div>
                <div className={classes.secondText}>
                  <Typography className={classes.typoSub}>
                    The user will need to relogin the portal with the new
                    credentials
                  </Typography>
                </div>
                <div className={classes.buttonGroup}>
                  <Button
                    data-cy="closeButton"
                    variant="outlined"
                    className={classes.buttonOutline}
                    onClick={handleClose}
                  >
                    No
                  </Button>
                  <Button
                    data-cy="closeButton"
                    variant="contained"
                    className={classes.buttonFilled}
                    onClick={() => {
                      if (resetPossible) setShowDiv(true);
                    }}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
export default ResetModal;
