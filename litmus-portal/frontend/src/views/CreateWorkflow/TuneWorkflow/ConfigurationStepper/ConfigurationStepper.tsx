import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
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

// getStepContent renders the stepper components
// for custom and predefined workflows
function getStepContent(
  step: number,
  engineIndex: number,
  isCustom: boolean | undefined,
  gotoStep: (page: number) => void,
  closeStepper: () => void
): React.ReactNode {
  switch (step) {
    case 0:
      return <General isCustom={isCustom} gotoStep={gotoStep} />;
    case 1:
      return (
        <TargetApplication engineIndex={engineIndex} gotoStep={gotoStep} />
      );
    case 2:
      return (
        <SteadyState
          engineIndex={engineIndex}
          gotoStep={gotoStep}
          closeStepper={closeStepper}
        />
      );
    default:
      return <General isCustom={isCustom} gotoStep={gotoStep} />;
  }
}

const ConfigurationStepper: React.FC<ConfigurationStepperProps> = ({
  experimentIndex,
  closeStepper,
  isCustom,
}) => {
  const classes = useStyles();

  // State variable to handle Stepper Steps
  const [activeStep, setActiveStep] = React.useState(0);

  // Steps of stepper for custom and predefined workflows
  const steps = [
    'General',
    'Target Application',
    'Define the steady state for this application',
  ];

  const gotoStep = (page: number) => {
    setActiveStep(page);
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
                {getStepContent(
                  index,
                  experimentIndex,
                  isCustom,
                  gotoStep,
                  closeStepper
                )}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default ConfigurationStepper;
