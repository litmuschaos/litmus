import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import React from 'react';
import { useSelector } from 'react-redux';
import config from '../../../../../../config';
import { RootState } from '../../../../../../redux/reducers';
import ButtonFilled from '../../../../../Button/ButtonFilled';
import useStyles from './styles';
import Unimodal from '../../../../../../containers/layouts/Unimodal';

// props for ResetModal component
interface ResetModalProps {
  resetPossible: boolean;
  password: string;
  username: string;
  handleModal: () => void;
}

// ResetModal displays modal for resetting the password
const ResetModal: React.FC<ResetModalProps> = ({
  resetPossible,
  username,
  password,
  handleModal,
}) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  // for conditional rendering of second div
  const [showDiv, setShowDiv] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
    setShowDiv(false);
  };

  const { userData } = useSelector((state: RootState) => state);
  const handleClick = () => {
    if (resetPossible) setOpen(true);

    fetch(`${config.auth.url}/reset/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        response.json();
      })

      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <div>
        <div className={classes.buttonFilled}>
          <ButtonFilled
            isPrimary={false}
            isDisabled={false}
            handleClick={handleClick}
          >
            <Typography>Save</Typography>
          </ButtonFilled>
        </div>

        <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
          {showDiv ? (
            // Second div
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

              <Button
                data-cy="closeButton"
                variant="contained"
                className={classes.buttonModalSucess}
                onClick={handleModal}
              >
                Done
              </Button>
            </div>
          ) : (
            // first div
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
                <ButtonFilled
                  isPrimary
                  isDisabled={false}
                  handleClick={() => {
                    if (resetPossible) setShowDiv(true);
                  }}
                >
                  <Typography>Yes</Typography>
                </ButtonFilled>
              </div>
            </div>
          )}
        </Unimodal>
      </div>
    </div>
  );
};
export default ResetModal;
