import { Typography } from '@material-ui/core';
import { Modal, ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import Loader from '../../../../../components/Loader';
import config from '../../../../../config';
import { getToken } from '../../../../../utils/auth';
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
  const { t } = useTranslation();

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
              <>
                {t(
                  'settings.userManagementTab.editUser.resetModal.button.save'
                )}
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
                    {t('settings.userManagementTab.editUser.resetModal.error')}
                  </strong>{' '}
                  {t(
                    'settings.userManagementTab.editUser.resetModal.headerErr'
                  )}
                </Typography>
              </div>
              <div className={classes.textSecondError}>
                <Typography className={classes.typoSub}>
                  {t('settings.userManagementTab.editUser.resetModal.error')}:{' '}
                  {error}
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
                      'settings.userManagementTab.editUser.resetModal.button.done'
                    )}
                  </>
                </ButtonFilled>
              </div>
            </div>
          ) : (
            <div className={classes.body}>
              <img src="./icons/checkmark.svg" alt="checkmark" />
              <div className={classes.textSucess}>
                <Typography className={classes.typo} align="center">
                  {t('settings.userManagementTab.editUser.resetModal.header')}{' '}
                  <strong>
                    {t(
                      'settings.userManagementTab.editUser.resetModal.headerStrong'
                    )}
                  </strong>
                </Typography>
              </div>
              <div className={classes.text1Sucess}>
                <Typography className={classes.typoSub} align="center">
                  {t('settings.userManagementTab.editUser.resetModal.info')}
                </Typography>
              </div>
              <div data-cy="done">
                <ButtonFilled
                  isPrimary
                  isDisabled={false}
                  handleClick={handleModal}
                >
                  {t(
                    'settings.userManagementTab.editUser.resetModal.button.done'
                  )}
                </ButtonFilled>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
export default ResetModal;
