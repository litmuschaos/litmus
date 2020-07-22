import Button from '@material-ui/core/Button';
import React from 'react';
// import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import MobileStepper from '@material-ui/core/MobileStepper';
import config from '../../config';
import useActions from '../../redux/actions';
import * as UserActions from '../../redux/actions/user';
import { history } from '../../redux/configureStore';
// import { RootState } from '../../redux/reducers';
import useStyles from './styles';
import ModalPage from './Modalpage';
import InputField from '../InputField';

function CStepper() {
  const classes = useStyles();

  const user = useActions(UserActions);

  // UserData consists of data fetched from the Redux Store
  // Uncomment if required

  // const { userData } = useSelector((state: RootState) => state);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [formError, setFormError] = React.useState<boolean>(false);

  const [info, setInfo] = React.useState({
    email: '',
    name: '',
    projectName: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [values, setValues] = React.useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = () => {
    Object.assign(info, { password: values.password });

    fetch(`${config.auth.url}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(info),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          setFormError(true);
        } else {
          user.updateUserDetails({
            name: data.name,
            email: data.email,
            projectName: data.projectName,
          });

          history.push('/');
        }
      })
      .catch((err) => {
        setFormError(true);
        console.error(err);
      });
  };

  const setData = (key: string, value: string) => {
    let data = info;
    data = {
      ...data,
      [key]: value,
    };
    setInfo(data);
  };

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
            setName="Administrator"
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
            setName="Administrator"
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
                    formError={formError}
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
            setName="Name"
            setText="Set your new personal Password"
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
            setName="Name"
            setText="You can change your current mail (optional)"
          />
        );
      default:
        return <Link to="/404" />;
    }
  };

  /* Reset is used to reset the steps and further can be used */
  /* to route but keep handlereset */
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
}

export default CStepper;
