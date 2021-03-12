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
import {
  getToken,
  getUserEmail,
  getUserName,
  getUsername,
} from '../../utils/auth';
import {
  validateConfirmPassword,
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

  const [projectName, setProjectName] = React.useState<string>('');

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [values, setValues] = React.useState({
    password: '',
    confirmPassword: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const rerender = () => {
    window.location.reload();
  };

  const [CreateUser] = useMutation<CreateUserData>(CREATE_USER, {
    onCompleted: () => {
      rerender();
      handleModal();
    },
  });

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    userLoader.updateUserDetails({ loader: true });

    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username: getUsername(),
        email: getUserEmail(),
        name: getUserName(),
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
                username: getUsername(),
                email: getUserEmail(),
                name: getUserName(),
                project_name: projectName,
              },
            },
          });
        }
      })
      .catch((err) => {
        isError.current = true;
        console.error(err);
      });
  };

  // If first character is empty then all the successive letters would
  // be treated as an error and button would be disabled
  // If the length is 0 then button would be disabled
  // [Button State: Disabled]
  if (activeStep === 0) {
    if (
      projectName.length > 0 &&
      validateStartEmptySpacing(projectName) === false
    ) {
      isError.current = false;
    } else {
      isError.current = true;
    }
  }

  // If the two passwords are not same then button would be disabled
  // Back Button: [Button State: Enabled]
  // Continue Button: [Button State: Disabled]
  if (activeStep === 1) {
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
  };

  // Submit on Enter Key-press
  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isError.current === false) {
      if (activeStep === 0) {
        handleNext();
        return;
      }
      if (activeStep === 1) {
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
                    value={projectName}
                    helperText={
                      validateStartEmptySpacing(projectName)
                        ? 'Should not start with an empty space'
                        : ''
                    }
                    variant={
                      validateStartEmptySpacing(projectName)
                        ? 'error'
                        : 'primary'
                    }
                    required
                    onChange={(e) => setProjectName(e.target.value)}
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
            setName={getUsername()}
            setText={t('welcomeModal.case-2.info')}
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
      <MobileStepper
        className={classes.stepper}
        variant="dots"
        steps={2}
        position="static"
        activeStep={activeStep}
        nextButton={handleNext}
        backButton={handleBack}
      />
    </div>
  );
};

export default CStepper;
