import React from 'react';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { StepIconProps } from '@material-ui/core/StepIcon';
import WelcomeStart from './WelcomeStart';
import NameModal from './NamingModal';
import useStyles from './styles';
import PasswordModal from './PasswordModal';
import Center from '../../containers/layouts/Center';

function QontoStepIcon(props: StepIconProps) {
  const classes = useStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.rootStepper, {
        [classes.activeStepper]: active,
      })}
    >
      {completed ? (
        <div className={classes.circleStepper} />
      ) : (
        <div className={classes.circleStepper} />
      )}
    </div>
  );
}

function getSteps() {
  return ['', '', ''];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <WelcomeStart />;
    case 1:
      return <NameModal />;
    case 2:
      return <PasswordModal />;
    default:
      return (
        <Center>
          <span style={{ height: '100px' }}>hello I&#39;m centered</span>
        </Center>
      );
  }
}

function CStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  /* Reset is used to reset the steps and further can be used */
  /* to route but keep handlereset */
  return (
    <div>
      <div>
        {activeStep === steps.length - 1 ? (
          <div>
            <Typography>{getStepContent(activeStep)}</Typography>
            <div>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleReset}
                data-cy="selectProjectFinish"
              >
                Let&#39;s start
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Typography>{getStepContent(activeStep)}</Typography>
            <div>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNext}
                data-cy="Welcome-continue"
              >
                {activeStep === steps.length ? "Let's start" : 'Continue'}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className={classes.stepper}>
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          data-cy="Welcome-stepper"
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={QontoStepIcon} />
            </Step>
          ))}
        </Stepper>
      </div>
    </div>
  );
}
export default CStepper;
