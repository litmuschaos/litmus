import { Divider, IconButton, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../../../../components/InputField';
import { validateLength } from '../../../../utils/validate';
import UserDetails from '../CreateUser/UserDetails';
import DelUser from './DelUser';
import ResetModal from './ResetModal';
import useStyles from './styles';

interface Password {
  password: string;
  showPassword: boolean;
}

// Props for CreateUser component
interface EditUserProps {
  handleDiv: () => void;
  email: string;
  userName: string;
  fullName: string;
}

// CreateUser displays the UI screen for creating a new user by admin
const EditUser: React.FC<EditUserProps> = ({
  handleDiv,
  email,
  userName,
  fullName,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // for conditional rendering of reset password div

  const [createPAssword, setCreatePassword] = React.useState<Password>({
    password: '',
    showPassword: false,
  });

  // handles password field
  const handleCreatePassword = (prop: keyof Password) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCreatePassword({
      ...createPAssword,
      [prop]: event.target.value,
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
            <strong>{t('settings.userManagementTab.editUser.header')}</strong>
          </Typography>
        </div>

        <Typography className={classes.descText}>
          {t('settings.userManagementTab.editUser.info')}
        </Typography>
        <div className={classes.container}>
          <div>
            <div className={classes.suSegments}>
              {/* Personal Details */}
              <UserDetails
                nameIsDisabled
                emailIsDisabled
                nameValue={fullName}
                usernameIsDisabled
                emailValue={email}
                userValue={userName}
              />

              <Divider className={classes.divider} />

              {/* Login Details */}

              <div>
                <Typography className={classes.headerText}>
                  <strong>
                    {t('settings.userManagementTab.editUser.login')}
                  </strong>
                </Typography>
                <div>
                  <form>
                    <div data-cy="editPassword" className={classes.details1}>
                      <InputField
                        required
                        helperText={
                          validateLength(createPAssword.password)
                            ? 'Password is too short'
                            : ''
                        }
                        handleChange={handleCreatePassword('password')}
                        type="password"
                        validationError={validateLength(
                          createPAssword.password
                        )}
                        label={t(
                          'settings.userManagementTab.editUser.label.newPassword'
                        )}
                        value={createPAssword.password}
                      />
                    </div>
                    <Divider className={classes.divider} />
                    <DelUser
                      handleModal={handleDiv}
                      handleTable={() => {}}
                      tableDelete={false}
                      teammingDel={false}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.buttonGroup}>
          <ResetModal
            resetPossible={createPAssword.password.length > 0}
            new_password={createPAssword.password}
            username={userName}
            handleModal={handleDiv}
          />
        </div>
      </div>
    </div>
  );
};
export default EditUser;
