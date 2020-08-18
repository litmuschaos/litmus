import { useMutation } from '@apollo/client/react/hooks';
import Button from '@material-ui/core/Button';
import MobileStepper from '@material-ui/core/MobileStepper';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import config from '../../../config';
import { RootState } from '../../../redux/reducers';
import { CREATE_USER } from '../../../schemas';
import InputField from '../../InputField';
import ModalPage from './Modalpage';
import useStyles from './styles';

interface CStepperProps {
  handleModal: () => void;
}
const CStepper: React.FC<CStepperProps> = ({ handleModal }) => {
  const classes = useStyles();

  const { userData } = useSelector((state: RootState) => state);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [formError, setFormError] = React.useState<boolean>(false);

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
      setFormError(true);
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
          setFormError(true);
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
        setFormError(true);
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

  // Render buttons based on active step
  const selectiveButtons = () => {
    if (activeStep === 0) {
      return (
        <div className={classes.buttonDiv}>
          <Button variant="contained" color="secondary" onClick={handleNext}>
            Continue
          </Button>
        </div>
      );
    }
    if (activeStep === 3) {
      return (
        <div className={classes.buttonDiv}>
          <Button className={classes.buttonOutline} onClick={handleBack}>
            Skip
          </Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit}>
            Let&#39;s Start
          </Button>
        </div>
      );
    }
    return (
      <div className={classes.buttonDiv}>
        <Button className={classes.buttonOutline} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" color="secondary" onClick={handleNext}>
          Continue
        </Button>
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
                <div className={classes.inputArea}>
                  <InputField
                    label="Project Name"
                    name="projectName"
                    value={info.projectName}
                    required
                    formError={formError}
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
                <div className={classes.inputArea}>
                  <InputField
                    label="Full Name"
                    name="fullName"
                    value={info.name}
                    formError={formError}
                    required
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
              <div className={classes.passwordSetterDiv}>
                <div className={classes.passwordArea}>
                  <InputField
                    label="Password"
                    name="password"
                    password
                    formError={formError}
                    required
                    value={values.password}
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
                    name="confirmPassword"
                    password
                    formError={values.confirmPassword !== values.password}
                    required
                    value={values.confirmPassword}
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
            setText="Set your new  Password"
          />
        );
      case 3:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea}>
                  <InputField
                    label="Email Address"
                    name="emailAddress"
                    formError={formError}
                    required
                    value={info.email}
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
