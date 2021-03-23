import React, { useRef } from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { ButtonOutlined } from 'litmus-ui';

import General from '../TuneWorkflowSteps/General';
import SteadyState from '../TuneWorkflowSteps/SteadyState';
import TargetApplication from '../TuneWorkflowSteps/TargetApplication';
import useStyles from './styles';

interface ConfigurationStepperProps {
  experimentIndex: number;
  closeStepper: () => void;
  isCustom: boolean | undefined;
}

interface ChildRef {
  onNext: () => void;
}

// getStepContent renders the stepper components
// for custom and predefined workflows
function getStepContent(
  step: number,
  engineIndex: number,
  isCustom: boolean | undefined,
  childRef: React.MutableRefObject<ChildRef | undefined>
): React.ReactNode {
  if (isCustom) {
    switch (step) {
      case 0:
        return <General ref={childRef} />;
      case 1:
        return (
          <TargetApplication
            isCustom
            engineIndex={engineIndex}
            ref={childRef}
          />
        );
      case 2:
        return <SteadyState engineIndex={engineIndex} ref={childRef} />;
      default:
        return <General ref={childRef} />;
    }
  } else {
    switch (step) {
      case 0:
        return (
          <TargetApplication
            isCustom={false}
            engineIndex={engineIndex}
            ref={childRef}
          />
        );
      case 1:
        return <SteadyState engineIndex={engineIndex} ref={childRef} />;
      default:
        return (
          <TargetApplication
            isCustom={false}
            engineIndex={engineIndex}
            ref={childRef}
          />
        );
    }
  }
}

const ConfigurationStepper: React.FC<ConfigurationStepperProps> = ({
  experimentIndex,
  closeStepper,
  isCustom,
}) => {
  const classes = useStyles();

  const childRef = useRef<ChildRef>();

  // State variable to handle Stepper Steps
  const [activeStep, setActiveStep] = React.useState(0);

  // Steps of stepper for custom and predefined workflows
  const steps = isCustom
    ? [
        'General',
        'Target Application',
        'Define the steady state for this application',
      ]
    : ['Target Application', 'Define the steady state for this application'];

  // Handles the Next and Finish button operations.
  const handleNext = () => {
    if (childRef.current && childRef.current.onNext) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    // the stepper will close
    // if (activeStep === steps.length - 1) {
    //   closeStepper();
    // }
  };

  // Handle the Back button operations.
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <div className={classes.root}>
      <div>
        <ButtonOutlined onClick={closeStepper} style={{ float: 'right' }}>
          &#x2715;
        </ButtonOutlined>
      </div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel className={classes.stepperLabel}>{label}</StepLabel>
            <StepContent>
              <Typography>
                {getStepContent(index, experimentIndex, isCustom, childRef)}
              </Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default ConfigurationStepper;
