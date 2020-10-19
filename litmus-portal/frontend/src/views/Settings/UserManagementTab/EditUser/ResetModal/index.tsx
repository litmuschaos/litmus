import { Typography } from '@material-ui/core';
import React from 'react';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import Loader from '../../../../../components/Loader';
import config from '../../../../../config';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import getToken from '../../../../../utils/getToken';
import useStyles from './styles';

// props for ResetModal component
interface ResetModalProps {
  resetPossible: boolean;
  new_password: string;
  username: string;
  handleModal: () => void;
}

// ResetModal displays modal for resetting the password
const ResetModal: React.FC<ResetModalProps> = ({
  resetPossible,
  username,
  new_password,
  handleModal,
}) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    setLoading(true);
    fetch(`${config.auth.url}/reset/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ username, new_password }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if ('error' in data) {
          setError(data.error_description as string);
        } else {
          setError('');
        }
        setLoading(false);
        setOpen(true);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message as string);
        if (resetPossible) {
          setLoading(false);
          setOpen(true);
        }
      });
  };

  return (
    <div>
      <div>
        <div data-cy="edit" className={classes.buttonFilled}>
          <ButtonFilled
            isPrimary={false}
            isDisabled={!(new_password.length && !loading)}
            handleClick={handleClick}
          >
            {loading ? (
              <div>
                <Loader size={20} />
              </div>
            ) : (
              <>Save</>
            )}
          </ButtonFilled>
        </div>
        <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn>
          {error.length ? (
            <div className={classes.errDiv}>
              <div className={classes.textError}>
                <Typography className={classes.typo} align="center">
                  <strong> Error </strong> while resetting password.
                </Typography>
              </div>
              <div className={classes.textSecondError}>
                <Typography className={classes.typoSub}>
                  Error: {error}
                </Typography>
              </div>
              <div data-cy="done" className={classes.buttonModal}>
                <ButtonFilled
                  isPrimary
                  isDisabled={false}
                  handleClick={handleClose}
                >
                  <>Done</>
                </ButtonFilled>
              </div>
            </div>
          ) : (
            <div className={classes.body}>
              <img src="./icons/checkmark.svg" alt="checkmark" />
              <div className={classes.textSucess}>
                <Typography className={classes.typo} align="center">
                  The user’s password was <strong>successfully reset </strong>
                </Typography>
              </div>
              <div className={classes.text1Sucess}>
                <Typography className={classes.typoSub} align="center">
                  The user needs to login with the new credentials.
                </Typography>
              </div>
              <div data-cy="done">
                <ButtonFilled
                  isPrimary
                  isDisabled={false}
                  handleClick={handleModal}
                >
                  Done
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
