import { Divider, Typography } from '@material-ui/core';
import { InputField, Modal } from 'litmus-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import Loader from '../../../../components/Loader';
import config from '../../../../config';
import { getToken } from '../../../../utils/auth';
import {
  validateConfirmPassword,
  validateStartEmptySpacing,
} from '../../../../utils/validate';
import PersonalDetails from '../PersonalDetails';
import useStyles from './styles';

// used for password field
interface Password {
  currPassword: string;
  newPassword: string;
  confNewPassword: string;
}

// AccountSettings displays the starting page of "Accounts" tab
const AccountSettings: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  // used for modal
  const [open, setOpen] = React.useState(false);
  const isSuccess = useRef<boolean>(false);
  const [loading, setLoading] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  // states for the three password fields
  const [password, setPassword] = React.useState<Password>({
    newPassword: '',
    currPassword: '',
    confNewPassword: '',
  });

  // handleCurrPassword handles password for first password field
  const handleCurrPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword({
      ...password,
      [prop]: event.target.value,
    });
  };

  // handleNewPassword handles password for second password field
  const handleNewPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword({
      ...password,
      [prop]: event.target.value,
    });
  };

  // handleConfPassword handles password for third password field
  const handleConfPassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword({
      ...password,
      [prop]: event.target.value,
    });
  };

  if (
    password.confNewPassword.length > 0 &&
    password.newPassword === password.confNewPassword
  )
    isSuccess.current = true;
  else isSuccess.current = false;
  const [error, setError] = useState<string>('');
  const handleChangePassword = () => {
    setLoading(true);
    fetch(`${config.auth.url}/update/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        old_password: password.currPassword,
        new_password: password.newPassword,
      }),
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
        setLoading(false);
        setError(err.message as string);
        setOpen(true);
      });
  };

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.suSegments}>
          {/* Below component renders the upper section of the page, displays personal details */}
          <PersonalDetails />
          <Divider className={classes.divider} />

          {/* Displays the lower segment containing the password details */}
          <Typography className={classes.headerText}>
            <strong>{t('settings.accountsTab.accountsSettings.header')}</strong>
          </Typography>
          <div className={classes.outerPass}>
            <form className={classes.innerPass}>
              {/* Current Password */}
              <div data-cy="currPassword">
                <InputField
                  required
                  value={password.currPassword}
                  onChange={handleCurrPassword('currPassword')}
                  type="password"
                  label={t(
                    'settings.accountsTab.accountsSettings.label.currPassword'
                  )}
                  variant="primary"
                />
              </div>
              {/* New Password */}
              <div style={{ marginTop: '1rem' }} />
              <div data-cy="newPassword">
                <InputField
                  required
                  type="password"
                  onChange={handleNewPassword('newPassword')}
                  helperText={
                    validateStartEmptySpacing(password.newPassword)
                      ? 'Should not start with empty space'
                      : ''
                  }
                  label={t(
                    'settings.accountsTab.accountsSettings.label.newPassword'
                  )}
                  variant={
                    validateStartEmptySpacing(password.newPassword)
                      ? 'error'
                      : isSuccess.current
                      ? 'success'
                      : 'primary'
                  }
                  value={password.newPassword}
                />
              </div>
              {/* Confirm new password */}
              <div style={{ marginTop: '1rem' }} />
              <div data-cy="confPassword">
                <InputField
                  helperText={
                    validateConfirmPassword(
                      password.newPassword,
                      password.confNewPassword
                    )
                      ? 'Password is not same'
                      : ''
                  }
                  required
                  type="password"
                  onChange={handleConfPassword('confNewPassword')}
                  label={t(
                    'settings.accountsTab.accountsSettings.label.confNewPassword'
                  )}
                  variant={
                    validateConfirmPassword(
                      password.newPassword,
                      password.confNewPassword
                    )
                      ? 'error'
                      : isSuccess.current
                      ? 'success'
                      : 'error'
                  }
                  value={password.confNewPassword}
                />
              </div>
              <div data-cy="change-password" className={classes.buttonModal}>
                <ButtonFilled
                  data-cy="button"
                  isPrimary
                  isDisabled={
                    !(
                      isSuccess.current &&
                      password.currPassword.length > 0 &&
                      !loading
                    )
                  }
                  handleClick={handleChangePassword}
                >
                  {loading ? (
                    <div>
                      <Loader size={20} />
                    </div>
                  ) : (
                    <>
                      {t(
                        'settings.accountsTab.accountsSettings.button.changePass'
                      )}
                    </>
                  )}
                </ButtonFilled>
              </div>
              <Modal open={open} onClose={handleClose}>
                {error.length ? (
                  <div className={classes.errDiv}>
                    <div className={classes.textError}>
                      <Typography className={classes.typo} align="center">
                        <strong>
                          {t(
                            'settings.accountsTab.accountsSettings.modal.headerErrStrong'
                          )}
                          :
                        </strong>{' '}
                        {t(
                          'settings.accountsTab.accountsSettings.modal.headerErr'
                        )}
                      </Typography>
                    </div>
                    <div className={classes.textSecondError}>
                      <Typography className={classes.typoSub}>
                        {t(
                          'settings.accountsTab.accountsSettings.modal.headerErrStrong'
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
                        <>
                          {t(
                            'settings.accountsTab.accountsSettings.button.done'
                          )}
                        </>
                      </ButtonFilled>
                    </div>
                  </div>
                ) : (
                  <div className={classes.body}>
                    <img src="./icons/lock.svg" alt="lock" />
                    <div className={classes.text}>
                      <Typography className={classes.typo} align="center">
                        {t(
                          'settings.accountsTab.accountsSettings.modal.header'
                        )}{' '}
                        <strong>
                          {t(
                            'settings.accountsTab.accountsSettings.modal.headerStrong'
                          )}
                        </strong>
                        Your password <strong>has been changed!</strong>
                      </Typography>
                    </div>
                    <div className={classes.text1}>
                      <Typography className={classes.typo1}>
                        {t('settings.accountsTab.accountsSettings.modal.info')}
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
                            'settings.accountsTab.accountsSettings.button.done'
                          )}
                        </>
                      </ButtonFilled>
                    </div>
                  </div>
                )}
              </Modal>
            </form>
            <div className={classes.col2}>
              <img src="./icons/pass.svg" data-cy="lock" alt="lockIcon" />
              {/*  <Typography className={classes.txt1}>
                Your new password <strong>must</strong> be:
              </Typography>
              <Typography className={classes.txt2}>
                1. Be at least 8 characters in length
              </Typography>
              <Typography className={classes.txt2}>
                2. Not be same as your current password
              </Typography>
              <Typography className={classes.txt2}>
                3. Be a combination of letters, numbers and special characters
              </Typography> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountSettings;
