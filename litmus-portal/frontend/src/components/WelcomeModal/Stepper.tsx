import { useMutation } from '@apollo/client/react/hooks';
import MobileStepper from '@material-ui/core/MobileStepper';
import { InputField } from 'litmus-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import config from '../../config';
import { CREATE_USER } from '../../graphql';
import { CreateUserData } from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as UserActions from '../../redux/actions/user';
import { RootState } from '../../redux/reducers';
import { getToken } from '../../utils/auth';
import {
  validateConfirmPassword,
  validateEmail,
  validateStartEmptySpacing,
} from '../../utils/validate';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline';
import ModalPage from './Modalpage';
import useStyles from './styles';

interface CStepperProps {
  handleModal: () => void;
}
const CStepper: React.FC<CStepperProps> = ({ handleModal }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userData = useSelector((state: RootState) => state.userData);
  const userLoader = useActions(UserActions);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const isError = useRef(true);
  const isSuccess = useRef(false);

  const [info, setInfo] = React.useState<CreateUserData>({
    username: userData.username,
    email: userData.email,
    name: userData.name,
    project_name: '',
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

  const [CreateUser] = useMutation<CreateUserData>(CREATE_USER, {
    onCompleted: () => {
      rerender();
    },
  });

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    Object.assign(info, { password: values.password });
    userLoader.updateUserDetails({ loader: true });

    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username: userData.username,
        email: info.email,
        name: info.name,
        password: values.password,
      }),
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
                project_name: info.project_name,
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
      info.project_name.length > 0 &&
      validateStartEmptySpacing(info.project_name) === false
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
            <div>{t('welcomeModal.button.continue')}</div>
          </ButtonFilled>
        </div>
      );
    }
    if (activeStep === 3) {
      return (
        <div className={classes.buttonDiv}>
          <div data-cy="backButton">
            <ButtonOutline isDisabled={false} handleClick={handleBack}>
              <>{t('welcomeModal.button.back')}</>
            </ButtonOutline>
          </div>
          <div data-cy="startButton">
            <ButtonFilled
              isPrimary
              isDisabled={isError.current}
              handleClick={handleSubmit}
              data-cy="Start"
            >
              <div>{t('welcomeModal.button.letsStart')}</div>
            </ButtonFilled>
          </div>
        </div>
      );
    }
    return (
      <div className={classes.buttonDiv}>
        <div data-cy="backButton">
          <ButtonOutline
            isDisabled={false}
            handleClick={handleBack}
            data-cy="Back"
          >
            <>{t('welcomeModal.button.back')}</>
          </ButtonOutline>
        </div>
        <div data-cy="startButton">
          <ButtonFilled
            isPrimary
            isDisabled={isError.current}
            handleClick={handleNext}
            data-cy="Continue"
          >
            <div>{t('welcomeModal.button.continue')}</div>
          </ButtonFilled>
        </div>
      </div>
    );
  };

  // Submit on Enter Key-press
  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isError.current === false) {
      if (activeStep === 0) {
        handleNext();
        return;
      }
      if (activeStep === 3) {
        handleSubmit();
        return;
      }
      handleNext();
    }
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
                    label={t('welcomeModal.case-0.label')}
                    value={info.project_name}
                    helperText={
                      validateStartEmptySpacing(info.project_name)
                        ? 'Should not start with an empty space'
                        : ''
                    }
                    variant={
                      validateStartEmptySpacing(info.project_name)
                        ? 'error'
                        : 'primary'
                    }
                    required
                    onChange={(e) => setData('project_name', e.target.value)}
                    onKeyPress={keyPress}
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
            setText={t('welcomeModal.case-0.info')}
          />
        );
      case 1:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputName">
                  <InputField
                    label={t('welcomeModal.case-1.label')}
                    value={info.name}
                    required
                    helperText={
                      validateStartEmptySpacing(info.name)
                        ? 'Should not start with an empty space'
                        : ''
                    }
                    variant={
                      validateStartEmptySpacing(info.name) ? 'error' : 'primary'
                    }
                    onChange={(event) => {
                      setData('name', event.target.value);
                    }}
                    onKeyPress={keyPress}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={info.name}
            setText={t('welcomeModal.case-1.info')}
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
                <div aria-details="spacer" style={{ margin: '0.5rem 0' }} />
                <div className={classes.passwordArea}>
                  <InputField
                    label={t('welcomeModal.case-2.label')}
                    type="password"
                    required
                    value={values.password}
                    variant={isSuccess.current ? 'primary' : 'error'}
                    onChange={(event) =>
                      setValues({
                        password: event.target.value,
                        confirmPassword: values.confirmPassword,
                      })
                    }
                    onKeyPress={keyPress}
                  />
                </div>
                <div aria-details="spacer" style={{ margin: '0.5rem 0' }} />
                <div className={classes.passwordArea}>
                  <InputField
                    label={t('welcomeModal.case-2.cnfLabel')}
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
                    variant={
                      validateConfirmPassword(
                        values.password,
                        values.confirmPassword
                      )
                        ? 'error'
                        : 'primary'
                    }
                    onChange={(event) =>
                      setValues({
                        password: values.password,
                        confirmPassword: event.target.value,
                      })
                    }
                    onKeyPress={keyPress}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={info.name}
            setText={t('welcomeModal.case-2.info')}
          />
        );
      case 3:
        return (
          <ModalPage
            renderMenu={
              <div className={classes.passwordSetterDiv}>
                <div className={classes.inputArea} data-cy="InputEmail">
                  <InputField
                    label={t('welcomeModal.case-3.label')}
                    required
                    value={info.email}
                    helperText={
                      validateEmail(info.email) ? 'Should be a valid email' : ''
                    }
                    variant={validateEmail(info.email) ? 'error' : 'primary'}
                    onChange={(event) => {
                      setData('email', event.target.value);
                    }}
                    onKeyPress={keyPress}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            // pass here corresponding name of user
            setName={info.name}
            setText={t('welcomeModal.case-3.info')}
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
