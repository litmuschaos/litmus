/* eslint-disable react/no-danger */
import { TextField, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { validateConfirmPassword } from '../../../utils/validate';
import useStyles from './styles';

interface PasswordReset {
  password: string;
  confirmPassword: string;
}

interface PasswordSetProps {
  handleNext: () => void;
  currentStep: number;
  totalStep: number;
  setPassword: (e: any) => void;
}
const PasswordSet: React.FC<PasswordSetProps> = ({
  handleNext,
  currentStep,
  totalStep,
  setPassword,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [values, setValues] = React.useState<PasswordReset>({
    password: '',
    confirmPassword: '',
  });
  const isError = useRef(true);
  const isSuccess = useRef(false);
  if (
    values.password.length > 0 &&
    values.confirmPassword.length > 0 &&
    validateConfirmPassword(values.password, values.confirmPassword) === false
  ) {
    isError.current = false;
    isSuccess.current = true;
  } else {
    isError.current = true;
    isSuccess.current = false;
  }

  const handleSubmit = () => {
    handleNext();
  };

  return (
    <div className={classes.rootDiv}>
      <div className={classes.rootLitmusText}>
        <img src="icons/LitmusLogoLight.svg" alt="litmus logo" />
        {/* TODO: Add translations */}
        <Typography className={classes.HeaderText}>
          Set your new password
        </Typography>
        <Typography className={classes.litmusText}>
          Set a new password which will be used when you login next time
        </Typography>
      </div>
      <form id="login-form" className={classes.inputDiv}>
        <TextField
          className={classes.inputValue}
          label={t('welcomeModal.case-2.label')}
          type="password"
          variant="filled"
          required
          value={values.password}
          onChange={(event) => {
            setValues({
              password: event.target.value,
              confirmPassword: values.confirmPassword,
            });
            setPassword(event);
          }}
        />
        <TextField
          className={classes.inputValue}
          label={t('welcomeModal.case-2.cnfLabel')}
          type="password"
          required
          value={values.confirmPassword}
          helperText={
            validateConfirmPassword(values.password, values.confirmPassword)
              ? 'Password is not same'
              : ''
          }
          variant="filled"
          onChange={(event) =>
            setValues({
              password: values.password,
              confirmPassword: event.target.value,
            })
          }
        />
        <div className={classes.buttonGroup}>
          <ButtonFilled
            className={classes.submitButton}
            type="submit"
            disabled={isError.current}
            onClick={handleSubmit}
          >
            Next
          </ButtonFilled>
          <Typography>
            Step {currentStep} of {totalStep}
          </Typography>
        </div>
      </form>
    </div>
  );
};

export default PasswordSet;
