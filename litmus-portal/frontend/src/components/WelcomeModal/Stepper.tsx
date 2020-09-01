import { useMutation } from '@apollo/client/react/hooks';
import MobileStepper from '@material-ui/core/MobileStepper';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ButtonFilled from '../Button/ButtonFilled';
import config from '../../config';
import { CREATE_USER } from '../../graphql';
import { RootState } from '../../redux/reducers';
import InputField from '../InputField';
import ModalPage from './Modalpage';
import useStyles from './styles';
import {
  validateStartEmptySpacing,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
} from '../../utils/validate';
import ButtonOutline from '../Button/ButtonOutline';

interface CStepperProps {
  handleModal: () => void;
}
const CStepper: React.FC<CStepperProps> = ({ handleModal }) => {
  const classes = useStyles();

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
      validatePassword(values.password) === false &&
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
            <div>Continue</div>
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
            <>Skip</>
          </ButtonOutline>
          <ButtonFilled
            isPrimary
            isDisabled={isError.current}
            handleClick={handleSubmit}
            data-cy="Start"
          >
            <div>Let&#39;s Start</div>
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
          <>Back</>
        </ButtonOutline>
        <ButtonFilled
          isPrimary
          isDisabled={isError.current}
          handleClick={handleNext}
          data-cy="Continue"
        >
          <div>Continue</div>
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
                    label="Project Name"
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
            setName={userData.name}
            setText="Do you want to name your project?"
          />
        );
      case 1:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputName">
                  <InputField
                    label="Full Name"
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
            setText="How do i call you?"
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
                    label="Password"
                    type="password"
                    required
                    helperText={
                      validatePassword(values.password)
                        ? 'Should be >= 6 & contain 1 alphanumeric character and a number'
                        : ''
                    }
                    validationError={validatePassword(values.password)}
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
                    label="Confirm Password"
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
                      validatePassword(values.confirmPassword) &&
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
            setText="Set your new Password"
          />
        );
      case 3:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputEmail">
                  <InputField
                    label="Email Address"
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
            setText="You can change your current mail (optional)"
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
        {activeStep === 3 ? (
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
