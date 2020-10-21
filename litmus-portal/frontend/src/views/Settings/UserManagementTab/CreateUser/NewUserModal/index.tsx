import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import Loader from '../../../../../components/Loader';
import config from '../../../../../config';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import getToken from '../../../../../utils/getToken';
import useStyles from './styles';

// Props for NewUserModal component
interface NewUserModalProps {
  showModal: boolean;
  username: string;
  password: string;
  name: string;
  email: string;
  handleDiv: () => void;
}

// NewUserModal displays a modal on creating a new user
const NewUserModal: React.FC<NewUserModalProps> = ({
  username,
  password,
  name,
  email,
  handleDiv,
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
    handleDiv();
  };
  const [error, setError] = useState<string>('');
  const handleOpen = () => {
    setLoading(true);
    fetch(`${config.auth.url}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ email, username, name, password }),
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
        setLoading(false);
        setOpen(true);
      });
  };

  return (
    <div>
      <div data-cy="createNewUserButton" className={classes.button}>
        <ButtonFilled
          isPrimary={false}
          isDisabled={!(username.length > 0 && password.length > 0 && !loading)}
          handleClick={handleOpen}
        >
          {loading ? (
            <div>
              <Loader size={20} />
            </div>
          ) : (
            <>Create</>
          )}
        </ButtonFilled>
      </div>
      <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn>
        {error.length ? (
          <div className={classes.errDiv}>
            {/* <img src="./icons/checkmark.svg" alt="checkmark" /> */}

            <div className={classes.textError}>
              <Typography className={classes.typo} align="center">
                <strong> Error </strong> while creating a new user.
              </Typography>
            </div>
            <div className={classes.textSecondError}>
              <Typography className={classes.typoSub}>
                Error: {error}
              </Typography>
            </div>
            <div data-cy="newUserDoneButton" className={classes.buttonModal}>
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
            <div className={classes.text}>
              <Typography className={classes.typo} align="center">
                A new user <strong>{name}</strong> was successfully created
              </Typography>
            </div>
            <div className={classes.textSecond}>
              <Typography className={classes.typoSub}>
                Now information about it will be displayed on the user
                management screen of the application.
              </Typography>
            </div>
            <div data-cy="newUserDoneButton" className={classes.buttonModal}>
              <ButtonFilled
                isPrimary
                isDisabled={false}
                handleClick={handleClose}
              >
                <>Done</>
              </ButtonFilled>
            </div>
          </div>
        )}
      </Unimodal>
    </div>
  );
};
export default NewUserModal;
