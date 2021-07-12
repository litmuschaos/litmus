import { Avatar, Typography } from '@material-ui/core';
import { ButtonOutlined, InputField, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateEmail, validateStartEmptySpacing } from '../../utils/validate';
import ChooseAvatarModal from '../ChooseAvatarModal';
import useStyles from './styles';

interface PersonalDetailsProps {
  handleNameChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  nameValue: string;
  handleUserChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  userValue: string;
  handleEmailChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emailValue: string;
  isUsernameDisabled: boolean;
  isNameDisabled: boolean;
  isEmailDisabled: boolean;
}

// Displays the personals details on the "accounts" tab
const UserDetails: React.FC<PersonalDetailsProps> = ({
  handleNameChange,
  nameValue,
  userValue,
  handleEmailChange,
  emailValue,
  handleUserChange,
  isUsernameDisabled,
  isNameDisabled,
  isEmailDisabled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);
  // avatar image source string
  const [avatar, setAvatar] = useState<string>('./avatars/default.svg');

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Typography className={classes.headerText}>
        <strong>
          {t('settings.userManagementTab.createUser.userDetails.header')}
        </strong>
      </Typography>
      <form>
        <div className={classes.details}>
          <div className={classes.dp}>
            <Avatar
              data-cy="avatar"
              alt="User"
              className={classes.avatarBackground}
              src={avatar}
            />
            {/* <Button className={classes.edit} onClick={handleOpen} disabled>
              {t('settings.userManagementTab.createUser.userDetails.button')}
            </Button> */}
            <Modal
              open={open}
              onClose={handleClose}
              modalActions={
                <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
              }
            >
              <ChooseAvatarModal
                avatar={avatar}
                setAvatar={setAvatar}
                handleSubmit={handleClose}
              />
            </Modal>
          </div>
          {/* Fields for details including Full name, email, username */}
          <div className={classes.details1}>
            <div data-cy="InputName">
              <InputField
                helperText={
                  validateStartEmptySpacing(nameValue)
                    ? 'Should not start with an empty space'
                    : ''
                }
                disabled={isNameDisabled}
                value={nameValue}
                onChange={handleNameChange}
                variant={
                  validateStartEmptySpacing(nameValue) ? 'error' : 'primary'
                }
                label={t(
                  'settings.userManagementTab.createUser.userDetails.label.fullName'
                )}
              />
            </div>
            <div data-cy="InputEmail">
              <InputField
                helperText={
                  validateEmail(emailValue) ? 'Should be a valid email' : ''
                }
                type="email"
                disabled={isEmailDisabled}
                value={emailValue}
                onChange={handleEmailChange}
                variant={validateEmail(emailValue) ? 'error' : 'primary'}
                label={t(
                  'settings.userManagementTab.createUser.userDetails.label.email'
                )}
              />
            </div>
            {/* Username is not editable by non admin user */}
            <div data-cy="username">
              <InputField
                helperText={
                  validateStartEmptySpacing(userValue)
                    ? t(
                        'settings.userManagementTab.createUser.userDetails.validationEmptySpace'
                      )
                    : ''
                }
                label={t(
                  'settings.userManagementTab.createUser.label.username'
                )}
                required
                value={userValue}
                disabled={isUsernameDisabled}
                onChange={handleUserChange}
                variant={
                  validateStartEmptySpacing(userValue) ? 'error' : 'primary'
                }
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
