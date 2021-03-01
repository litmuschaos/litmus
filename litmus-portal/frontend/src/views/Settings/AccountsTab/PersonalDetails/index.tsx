import { useMutation, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import Loader from '../../../../components/Loader';
import config from '../../../../config';
import { GET_USER, UPDATE_DETAILS } from '../../../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
} from '../../../../models/graphql/user';
import { UpdateUser } from '../../../../models/redux/user';
import { getToken, getUsername } from '../../../../utils/auth';
import UserDetails from '../../UserManagementTab/CreateUser/UserDetails';
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

  const username = getUsername();
  const [loading, setLoading] = React.useState(false);
  // Query to get user details
  const { data: dataA } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    { variables: { username } }
  );
  const [error, setError] = useState<string>('');
  const name: string = dataA?.getUser.name ?? ''; // Check if can be replaced with JWT based data.
  const email: string = dataA?.getUser.email ?? '';
  const [personaData, setPersonaData] = React.useState<personaData>({
    email,
    userName: username,
    fullName: name,
  });
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
  const [updateDetails] = useMutation<UpdateUser>(UPDATE_DETAILS, {
    onCompleted: () => {
      setLoading(false);
      setOpen(true);
    },
    onError: (error) => {
      setLoading(false);
      setError(error.message as string);
      setOpen(true);
    },
    refetchQueries: [{ query: GET_USER, variables: { username } }],
  });
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
        username,
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
          updateDetails({
            variables: {
              user: {
                id: dataA?.getUser.id,
                name: personaData.fullName,
                email: personaData.email,
              },
            },
          });
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
      <form>
        <UserDetails
          emailIsDisabled={false}
          nameIsDisabled={false}
          nameValue={personaData.fullName}
          usernameIsDisabled
          handleNameChange={handleNameChange}
          emailValue={personaData.email}
          handleEmailChange={handleEmailChange}
          userValue={personaData.userName}
          handleUserChange={handleUserChange}
        />
        <div className={classes.saveButton}>
          <div data-cy="save">
            <ButtonFilled
              isDisabled={!(personaData.fullName.length && !loading)}
              isPrimary
              handleClick={handleSubmit}
            >
              {loading ? (
                <div>
                  <Loader size={20} />
                </div>
              ) : (
                <>
                  {t('settings.accountsTab.personalDetails.button.saveChanges')}
                </>
              )}
            </ButtonFilled>
          </div>
          <Modal
            open={open}
            onClose={handleClose}
            modalActions={
              <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
            }
          >
            {error.length ? (
              <div className={classes.errDiv}>
                {/* <img src="./icons/checkmark.svg" alt="checkmark" /> */}
                <div className={classes.textError}>
                  <Typography className={classes.typo} align="center">
                    <strong>
                      {t(
                        'settings.accountsTab.personalDetails.modal.headerErrStrong'
                      )}
                      :
                    </strong>{' '}
                    {t('settings.accountsTab.personalDetails.modal.headerErr')}
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
                  <ButtonFilled
                    isPrimary
                    isDisabled={false}
                    handleClick={handleClose}
                  >
                    <>{t('settings.accountsTab.personalDetails.button.done')}</>
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
                  <ButtonFilled
                    isPrimary
                    isDisabled={false}
                    handleClick={handleClose}
                  >
                    <>{t('settings.accountsTab.personalDetails.button.done')}</>
                  </ButtonFilled>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </form>
    </div>
  );
};
export default PersonalDetails;
