/* eslint-disable react/no-danger */
import { Typography } from '@material-ui/core';
import { ButtonFilled, InputField } from 'litmus-ui';
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
          {t('getStarted.password.info')}
        </Typography>
        <Typography className={classes.litmusText}>
          {t('getStarted.password.desc')}
        </Typography>
      </div>
      <form id="login-form" className={classes.inputDiv}>
        <InputField
          className={classes.inputValue}
          label={t('getStarted.password.label')}
          type="password"
          filled
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
        <InputField
          className={classes.inputValue}
          label={t('getStarted.password.cnfLabel')}
          type="password"
          required
          value={values.confirmPassword}
          helperText={
            validateConfirmPassword(values.password, values.confirmPassword)
              ? 'Password is not same'
              : ''
          }
          filled
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
            {t('getStarted.button.continue')}
          </ButtonFilled>
          <Typography className={classes.step}>
            {t('getStarted.button.step')} {currentStep}{' '}
            {t('getStarted.button.of')} {totalStep}
          </Typography>
        </div>
      </form>
    </div>
  );
};

export default PasswordSet;
