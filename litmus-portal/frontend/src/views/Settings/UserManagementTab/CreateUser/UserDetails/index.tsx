import { Avatar, Button, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputFieldOutline from '../../../../../components/InputFieldOutline';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import {
  validateEmail,
  validateStartEmptySpacing,
} from '../../../../../utils/validate';
import ChooseAvatarModal from '../ChooseAvatarModal';
import useStyles from './styles';

interface PersonalDetailsProps {
  handleNameChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  nameValue: string;
  handleUserChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  userValue: string;
  handleEmailChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emailValue: string;
  usernameIsDisabled: boolean;
  nameIsDisabled: boolean;
  emailIsDisabled: boolean;
}

// Displays the personals details on the "accounts" tab
const UserDetails: React.FC<PersonalDetailsProps> = ({
  handleNameChange,
  nameValue,
  handleUserChange,
  userValue,
  handleEmailChange,
  emailValue,
  usernameIsDisabled,
  nameIsDisabled,
  emailIsDisabled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);
  // avatar image source string
  const [avatar, setAvatar] = useState<string>('./avatars/default.svg');

  const handleOpen = () => {
    setOpen(true);
  };

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
            <Button className={classes.edit} onClick={handleOpen} disabled>
              {t('settings.userManagementTab.createUser.userDetails.button')}
            </Button>
            <Unimodal open={open} handleClose={handleClose} hasCloseBtn>
              <ChooseAvatarModal
                avatar={avatar}
                setAvatar={setAvatar}
                handleSubmit={handleClose}
              />
            </Unimodal>
          </div>
          {/* Fields for details including Full name, email, username */}
          <div className={classes.details1}>
            <div data-cy="InputName">
              <InputFieldOutline
                required
                helperText={
                  validateStartEmptySpacing(nameValue)
                    ? 'Should not start with an empty space'
                    : ''
                }
                value={nameValue}
                disabled={nameIsDisabled}
                handleChange={handleNameChange}
                validationError={validateStartEmptySpacing(nameValue)}
                label={t(
                  'settings.userManagementTab.createUser.userDetails.label.fullName'
                )}
              />
            </div>
            <div data-cy="InputEmail">
              <InputFieldOutline
                required
                helperText={
                  validateEmail(emailValue) ? 'Should be a valid email' : ''
                }
                type="email"
                value={emailValue}
                disabled={emailIsDisabled}
                handleChange={handleEmailChange}
                validationError={validateEmail(emailValue)}
                label={t(
                  'settings.userManagementTab.createUser.userDetails.label.email'
                )}
              />
            </div>
            {/* Username is not editable by non admin user */}
            <div data-cy="username">
              <InputFieldOutline
                value={userValue}
                handleChange={handleUserChange}
                disabled={usernameIsDisabled}
                validationError={false}
                label={t(
                  'settings.userManagementTab.createUser.userDetails.label.username'
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
