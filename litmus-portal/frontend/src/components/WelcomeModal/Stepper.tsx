import { useMutation } from '@apollo/client/react/hooks';
import MobileStepper from '@material-ui/core/MobileStepper';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import config from '../../config';
import { CREATE_USER } from '../../graphql';
import { RootState } from '../../redux/reducers';
import {
  validateConfirmPassword,
  validateEmail,
  validateStartEmptySpacing,
} from '../../utils/validate';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline';
import InputField from '../InputField';
import ModalPage from './Modalpage';
import useStyles from './styles';

interface CStepperProps {
  handleModal: () => void;
}
const CStepper: React.FC<CStepperProps> = ({ handleModal }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { userData } = useSelector((state: RootState) => state);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const isError = useRef(true);
  const isSuccess = useRef(false);

  const [info, setInfo] = React.useState({
    email: '',
    name: '',
    projectName: '',
  });

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [values, setValues] = React.useState({
    password: '',
    confirmPassword: '',
  });

  const handleNext = () => {
    if (activeStep === 2 && values.confirmPassword !== values.password) {
      isError.current = true;
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  const rerender = () => {
    window.location.reload();
  };

  const [CreateUser] = useMutation(CREATE_USER, {
    onCompleted: () => {
      rerender();
    },
  });

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    Object.assign(info, { password: values.password });

    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify(info),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          isError.current = true;
        } else {
          CreateUser({
            variables: {
              user: {
                username: userData.username,
                email: info.email,
                name: info.name,
                project_name: info.projectName,
              },
            },
          });
        }
      })
      .catch((err) => {
        isError.current = true;
        console.error(err);
      });

    handleModal();
  };

  const setData = (key: string, value: string) => {
    let data = info;
    data = {
      ...data,
      [key]: value,
    };
    setInfo(data);
  };

  // Custom Button Validation

  // If first character is empty then all the successive letters would
  // be treated as an error and button would be disabled
  // If the length is 0 then button would be disabled
  // [Button State: Disabled]
  if (activeStep === 0) {
    if (
      info.projectName.length > 0 &&
      validateStartEmptySpacing(info.projectName) === false
    ) {
      isError.current = false;
    } else {
      isError.current = true;
    }
  }

  // If first character is empty then all the successive letters would
  // be treated as an error and button would be disabled
  // If the length is 0 then button would be disabled
  // Back Button: [Button State: Enabled]
  // Continue Button: [Button State: Disabled]
  if (activeStep === 1) {
    if (
      info.name.length > 0 &&
      validateStartEmptySpacing(info.name) === false
    ) {
      isError.current = false;
    } else {
      isError.current = true;
    }
  }

  // If password is less than 6 characters and does not contain
  // an alpha numeric character as well as a number
  // then button would be disabled
  // If the two passwords are not same then button would be disabled
  // Back Button: [Button State: Enabled]
  // Continue Button: [Button State: Disabled]
  if (activeStep === 2) {
    if (
      values.password.length > 0 &&
      values.confirmPassword.length > 0 &&
      // validatePassword(values.password) === false &&
      validateConfirmPassword(values.password, values.confirmPassword) === false
    ) {
      isError.current = false;
      isSuccess.current = true;
    } else {
      isError.current = true;
      isSuccess.current = false;
    }
  }

  // If entered email is not a valid email then button would be disabled
  // Skip Button: [Button State: Enabled]
  // Let's Start Button: [Button State: Disabled]
  if (activeStep === 3) {
    if (info.email.length > 0 && validateEmail(info.email) === false) {
      isError.current = false;
    } else {
      isError.current = true;
    }
  }

  // Render buttons based on active step
  const selectiveButtons = () => {
    if (activeStep === 0) {
      return (
        <div className={classes.buttonDiv} data-cy="Continue">
          <ButtonFilled
            isPrimary
            isDisabled={isError.current}
            handleClick={handleNext}
          >
            <div>{t('welcomeModel.button.continue')}</div>
          </ButtonFilled>
        </div>
      );
    }
    if (activeStep === 3) {
      return (
        <div className={classes.buttonDiv}>
          <ButtonOutline
            isDisabled={false}
            handleClick={handleBack}
            data-cy="Skip"
          >
            <>{t('welcomeModel.button.skip')}</>
          </ButtonOutline>
          <ButtonFilled
            isPrimary
            isDisabled={isError.current}
            handleClick={handleSubmit}
            data-cy="Start"
          >
            <div>{t('welcomeModel.button.letsStart')}</div>
          </ButtonFilled>
        </div>
      );
    }
    return (
      <div className={classes.buttonDiv}>
        <ButtonOutline
          isDisabled={false}
          handleClick={handleBack}
          data-cy="Back"
        >
          <>{t('welcomeModel.button.back')}</>
        </ButtonOutline>
        <ButtonFilled
          isPrimary
          isDisabled={isError.current}
          handleClick={handleNext}
          data-cy="Continue"
        >
          <div>{t('welcomeModel.button.continue')}</div>
        </ButtonFilled>
      </div>
    );
  };

  // Content of the steps based on active step count
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputProjectName">
                  <InputField
                    label={t('welcomeModel.case-0.label')}
                    value={info.projectName}
                    required
                    helperText={
                      validateStartEmptySpacing(info.projectName)
                        ? 'Should not start with an empty space'
                        : ''
                    }
                    validationError={validateStartEmptySpacing(
                      info.projectName
                    )}
                    type="text"
                    handleChange={(event) => {
                      setData('projectName', event.target.value);
                    }}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={
              userData.username === 'admin'
                ? 'Administrator'
                : userData.username
            }
            setText={t('welcomeModel.case-0.info')}
          />
        );
      case 1:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputName">
                  <InputField
                    label={t('welcomeModel.case-1.label')}
                    value={info.name}
                    required
                    helperText={
                      validateStartEmptySpacing(info.name)
                        ? 'Should not start with an empty space'
                        : ''
                    }
                    validationError={validateStartEmptySpacing(info.name)}
                    handleChange={(event) => {
                      setData('name', event.target.value);
                    }}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={info.name}
            setText={t('welcomeModel.case-1.info')}
          />
        );
      case 2:
        return (
          <ModalPage
            renderMenu={
              <div
                className={classes.passwordSetterDiv}
                data-cy="InputPassword"
              >
                <div className={classes.passwordArea}>
                  <InputField
                    label={t('welcomeModel.case-2.label')}
                    type="password"
                    required
                    validationError={false}
                    value={values.password}
                    success={isSuccess.current}
                    handleChange={(event) =>
                      setValues({
                        password: event.target.value,
                        confirmPassword: values.confirmPassword,
                      })
                    }
                  />
                </div>
                <div className={classes.passwordArea}>
                  <InputField
                    label={t('welcomeModel.case-2.cnfLabel')}
                    type="password"
                    required
                    value={values.confirmPassword}
                    helperText={
                      validateConfirmPassword(
                        values.password,
                        values.confirmPassword
                      )
                        ? 'Password is not same'
                        : ''
                    }
                    success={isSuccess.current}
                    validationError={
                      // validatePassword(values.confirmPassword) &&
                      validateConfirmPassword(
                        values.password,
                        values.confirmPassword
                      )
                    }
                    handleChange={(event) =>
                      setValues({
                        password: values.password,
                        confirmPassword: event.target.value,
                      })
                    }
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={info.name}
            setText={t('welcomeModel.case-2.info')}
          />
        );
      case 3:
        return (
          <ModalPage
            renderMenu={
              <div className={classes.passwordSetterDiv}>
                <div className={classes.inputArea} data-cy="InputName">
                  <InputField
                    label={t('welcomeModel.case-3.label')}
                    required
                    value={info.email}
                    helperText={
                      validateEmail(info.email) ? 'Should be a valid email' : ''
                    }
                    validationError={validateEmail(info.email)}
                    handleChange={(event) => {
                      setData('email', event.target.value);
                    }}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            // pass here corresponding name of user
            setName={info.name}
            setText={t('welcomeModel.case-3.info')}
          />
        );

      default:
        return <Link to="/404" />;
    }
  };

  /*
    The Stepper which can modify modal content
    based on active step
  */
  return (
    <div>
      <div>
        {activeStep === 1 ? (
          <div>{getStepContent(activeStep)}</div>
        ) : (
          <div>{getStepContent(activeStep)}</div>
        )}
      </div>
      <div className={classes.stepper}>
        <MobileStepper
          variant="dots"
          steps={4}
          position="static"
          activeStep={activeStep}
          nextButton={handleNext}
          backButton={handleBack}
        />
      </div>
    </div>
  );
};

export default CStepper;
