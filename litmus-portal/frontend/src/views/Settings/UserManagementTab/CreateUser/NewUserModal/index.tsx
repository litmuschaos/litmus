import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
            <>
              {t(
                'settings.userManagementTab.createUser.newUserModal.button.create'
              )}
            </>
          )}
        </ButtonFilled>
      </div>
      <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn>
        {error.length ? (
          <div className={classes.errDiv}>
            {/* <img src="./icons/checkmark.svg" alt="checkmark" /> */}

            <div className={classes.textError}>
              <Typography className={classes.typo} align="center">
                <Trans i18nKey="settings.userManagementTab.createUser.newUserModal.headerErr">
                  <strong> Error </strong> while creating a new user.
                </Trans>
              </Typography>
            </div>
            <div className={classes.textSecondError}>
              <Typography className={classes.typoSub}>
                {t('settings.userManagementTab.createUser.newUserModal.error')}:{' '}
                {error}
              </Typography>
            </div>
            <div
              data-cy="newUserSuccessfulDoneButton"
              className={classes.buttonModal}
            >
              <ButtonFilled
                isPrimary
                isDisabled={false}
                handleClick={handleClose}
              >
                <>
                  {t(
                    'settings.userManagementTab.createUser.newUserModal.button.done'
                  )}
                </>
              </ButtonFilled>
            </div>
          </div>
        ) : (
          <div className={classes.body}>
            <img src="./icons/checkmark.svg" alt="checkmark" />
            <div className={classes.text}>
              <Typography className={classes.typo} align="center">
                <Trans
                  i18nKey="settings.userManagementTab.createUser.newUserModal.header"
                  name={name}
                >
                  A new user <strong>{{ name }}</strong> was successfully
                  created
                </Trans>
              </Typography>
            </div>
            <div className={classes.textSecond}>
              <Typography className={classes.typoSub}>
                {t('settings.userManagementTab.createUser.newUserModal.info')}
              </Typography>
            </div>
            <div data-cy="done" className={classes.buttonModal}>
              <ButtonFilled
                isPrimary
                isDisabled={false}
                handleClick={handleClose}
              >
                <>
                  {t(
                    'settings.userManagementTab.createUser.newUserModal.button.done'
                  )}
                </>
              </ButtonFilled>
            </div>
          </div>
        )}
      </Unimodal>
    </div>
  );
};
export default NewUserModal;
