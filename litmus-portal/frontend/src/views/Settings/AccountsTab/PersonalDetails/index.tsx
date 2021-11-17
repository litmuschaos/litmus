import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import UserDetails from '../../../../components/UserDetails';
import config from '../../../../config';
import Center from '../../../../containers/layouts/Center';
import { getToken, getUserId } from '../../../../utils/auth';
import useStyles from './styles';

interface personaData {
  email: string;
  userName: string;
  fullName: string;
}

// Displays the personals details on the "accounts" tab
const PersonalDetails: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);

  const [loading, setLoading] = React.useState(false);
  // Query to get user details

  const [error, setError] = useState<string>('');

  const [personaData, setPersonaData] = React.useState<personaData>({
    email: '',
    userName: '',
    fullName: '',
  });

  React.useEffect(() => {
    setDataLoading(true);

    fetch(`${config.auth.url}/getUser/${getUserId()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPersonaData({
          fullName: data?.name,
          userName: data?.username,
          email: data?.email,
        });
        setDataLoading(false);
      });
  }, []);

  // For closing and opening of the modal
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleUserChange = (e: any) => {
    setPersonaData({
      fullName: personaData.fullName,
      userName: e.target.value,
      email: personaData.email,
    });
  };
  const handleNameChange = (e: any) => {
    setPersonaData({
      fullName: e.target.value,
      userName: personaData.userName,
      email: personaData.email,
    });
  };
  const handleEmailChange = (e: any) => {
    setPersonaData({
      fullName: personaData.fullName,
      userName: personaData.userName,
      email: e.target.value,
    });
  };

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    setLoading(true);
    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        name: personaData.fullName,
        email: personaData.email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          setError(data.error_description as string);
          setLoading(false);
          setOpen(true);
        } else {
          setLoading(false);
          setOpen(true);
        }
      })
      .catch((err) => {
        setError(err.message as string);
        setOpen(true);
        setLoading(false);
        console.error(err);
      });
  };
  return (
    <div>
      {dataLoading ? (
        <Center>
          <Loader size={40} message="Loading user details..." />
        </Center>
      ) : (
        <>
          <form>
            <UserDetails
              nameValue={personaData.fullName}
              isUsernameDisabled
              handleNameChange={handleNameChange}
              emailValue={personaData.email}
              handleEmailChange={handleEmailChange}
              userValue={personaData.userName}
              handleUserChange={handleUserChange}
              isNameDisabled={false}
              isEmailDisabled={false}
            />
            <div className={classes.saveButton}>
              <div data-cy="save">
                <ButtonFilled
                  disabled={!(personaData?.fullName?.length && !loading)}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <div>
                      <Loader size={20} />
                    </div>
                  ) : (
                    <>
                      {t(
                        'settings.accountsTab.personalDetails.button.saveChanges'
                      )}
                    </>
                  )}
                </ButtonFilled>
              </div>
              <Modal
                open={open}
                onClose={handleClose}
                modalActions={
                  <ButtonOutlined onClick={handleClose}>
                    &#x2715;
                  </ButtonOutlined>
                }
              >
                {error.length ? (
                  <div className={classes.errDiv}>
                    <div className={classes.textError}>
                      <Typography className={classes.typo} align="center">
                        <strong>
                          {t(
                            'settings.accountsTab.personalDetails.modal.headerErrStrong'
                          )}
                          :
                        </strong>{' '}
                        {t(
                          'settings.accountsTab.personalDetails.modal.headerErr'
                        )}
                      </Typography>
                    </div>
                    <div className={classes.textSecondError}>
                      <Typography className={classes.typoSub}>
                        {t(
                          'settings.accountsTab.personalDetails.modal.headerErrStrong'
                        )}
                        : {error}
                      </Typography>
                    </div>
                    <div data-cy="done" className={classes.buttonModal}>
                      <ButtonFilled onClick={handleClose}>
                        <>
                          {t(
                            'settings.accountsTab.personalDetails.button.done'
                          )}
                        </>
                      </ButtonFilled>
                    </div>
                  </div>
                ) : (
                  <div className={classes.body}>
                    <img src="./icons/userLarge.svg" alt="user" />
                    <div className={classes.text}>
                      <Typography className={classes.typo} align="center">
                        {t('settings.accountsTab.personalDetails.modal.header')}{' '}
                        <strong>
                          {t(
                            'settings.accountsTab.personalDetails.modal.headerStrong'
                          )}
                        </strong>
                      </Typography>
                    </div>
                    <div className={classes.text1}>
                      <Typography align="center" className={classes.typo1}>
                        {t('settings.accountsTab.personalDetails.modal.info')}
                      </Typography>
                    </div>
                    <div data-cy="done">
                      <ButtonFilled onClick={handleClose}>
                        <>
                          {t(
                            'settings.accountsTab.personalDetails.button.done'
                          )}
                        </>
                      </ButtonFilled>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
export default PersonalDetails;
