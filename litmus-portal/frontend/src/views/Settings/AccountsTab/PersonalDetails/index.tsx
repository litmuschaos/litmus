import { useMutation, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import UserDetails from '../../../../components/UserDetails';
import config from '../../../../config';
import { GET_USER, UPDATE_DETAILS } from '../../../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
} from '../../../../models/graphql/user';
import { UpdateUser } from '../../../../models/userData';
import { getToken, getUsername } from '../../../../utils/auth';
import useStyles from './styles';

interface personaData {
  email: string;
  userName: string;
  fullName: string;
}

// Displays the personals details on the "accounts" tab
const PersonalDetails: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const username = getUsername();
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string>('');

  // Set Default values
  const [personaData, setPersonaData] = useState<personaData>({
    email: '',
    userName: username,
    fullName: '',
  });

  // Get user details
  const { data: dataA } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    {
      variables: { username },
      onCompleted: (data) => {
        setPersonaData({
          userName: username,
          email: data.getUser.email,
          fullName: data.getUser.name,
        });
      },
      fetchPolicy: 'cache-and-network',
    }
  );

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
              disabled={!(personaData.fullName.length && !loading)}
              onClick={handleSubmit}
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
                  <ButtonFilled onClick={handleClose}>
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
                  <ButtonFilled onClick={handleClose}>
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
