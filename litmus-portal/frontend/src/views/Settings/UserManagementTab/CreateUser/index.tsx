import { Divider, IconButton, Typography } from '@material-ui/core';
import { InputField } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import UserDetails from '../../../../components/UserDetails';
import NewUserModal from './NewUserModal';
import useStyles from './styles';

interface Password {
  password: string;
  showPassword: boolean;
}

interface personalData {
  email: string;
  userName: string;
  fullName: string;
}

// Props for CreateUser component
interface CreateUserProps {
  handleDiv: () => void;
}

// CreateUser displays the UI screen for creating a new user by admin
const CreateUser: React.FC<CreateUserProps> = ({ handleDiv }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // for conditional rendering of reset password div
  const [createPassword, setCreatePassword] = React.useState<Password>({
    password: '',
    showPassword: false,
  });

  // handles password field
  const handleCreatePassword =
    (prop: keyof Password) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCreatePassword({
        ...createPassword,
        [prop]: event.target.value,
      });
    };

  // for personal details fields
  const [personalData, setPersonalData] = React.useState<personalData>({
    email: '',
    userName: '',
    fullName: '',
  });

  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalData({
      ...personalData,
      userName: event.target.value,
    });
  };

  return (
    <div>
      <div className={classes.headDiv}>
        <div className={classes.createDiv}>
          <IconButton
            data-cy="backButton"
            onClick={handleDiv}
            className={classes.backButton}
          >
            <img src="./icons/BackArrow.svg" alt="back" />
          </IconButton>
          <Typography className={classes.divHeaderText}>
            <strong>{t('settings.userManagementTab.createUser.header')}</strong>
          </Typography>
        </div>

        <Typography className={classes.descText}>
          {t('settings.userManagementTab.createUser.info')}
        </Typography>

        <div className={classes.container}>
          {/* Personal Details */}
          <UserDetails
            nameValue={personalData.fullName}
            isUsernameDisabled={false}
            handleNameChange={(e) => {
              setPersonalData({
                fullName: e.target.value,
                userName: personalData.userName,
                email: personalData.email,
              });
            }}
            isEmailDisabled={false}
            isNameDisabled={false}
            emailValue={personalData.email}
            handleEmailChange={(e) => {
              setPersonalData({
                fullName: personalData.fullName,
                userName: personalData.userName,
                email: e.target.value,
              });
            }}
            userValue={personalData.userName}
            handleUserChange={(e) => {
              setPersonalData({
                fullName: personalData.fullName,
                userName: e.target.value,
                email: personalData.email,
              });
            }}
          />

          <Divider className={classes.divider} />

          {/* Login Details */}

          <div>
            <Typography className={classes.headerText}>
              <strong>
                {t('settings.userManagementTab.createUser.login')}
              </strong>
            </Typography>
            <div>
              <form>
                <div className={classes.details1}>
                  <div data-cy="userName">
                    <InputField
                      label={t(
                        'settings.userManagementTab.createUser.label.username'
                      )}
                      value={personalData.userName}
                      onChange={handleUsername}
                      disabled
                    />
                  </div>
                  <div data-cy="passwordInput">
                    <InputField
                      className={classes.secondInputField}
                      required
                      type="password"
                      onChange={handleCreatePassword('password')}
                      value={createPassword.password}
                      label={t(
                        'settings.userManagementTab.createUser.label.newPassword'
                      )}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className={classes.buttonGroup}>
          <NewUserModal
            handleDiv={handleDiv}
            showModal={
              personalData.userName.length > 0 &&
              createPassword.password.length > 0
            }
            name={personalData.fullName}
            email={personalData.email}
            username={personalData.userName}
            password={createPassword.password}
          />
        </div>
      </div>
    </div>
  );
};
export default CreateUser;
