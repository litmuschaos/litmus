import React, { useState } from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { ButtonOutlined } from 'litmus-ui';
import YAML from 'yaml';
import { useSelector } from 'react-redux';
import General from '../TuneWorkflowSteps/General';
import SteadyState from '../TuneWorkflowSteps/SteadyState';
import TargetApplication from '../TuneWorkflowSteps/TargetApplication';
import useStyles from './styles';
import { WorkflowManifest } from '../../../../models/redux/workflow';
import { RootState } from '../../../../redux/reducers';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import useActions from '../../../../redux/actions';

interface ConfigurationStepperProps {
  experimentIndex: number;
  closeStepper: () => void;
  isCustom: boolean | undefined;
}

// getStepContent renders the stepper components
// for custom and predefined workflows
function getStepContent(
  step: number,
  isCustom: boolean | undefined,
  chaosEngine: any,
  setChaosEngine: React.Dispatch<any>
) {
  if (isCustom) {
    switch (step) {
      case 0:
        return <General />;
      case 1:
        return (
          <TargetApplication
            isCustom
            chaosEngine={chaosEngine}
            setChaosEngine={setChaosEngine}
          />
        );
      case 2:
        return <SteadyState />;
      default:
        return <General />;
    }
  } else {
    switch (step) {
      case 0:
        return (
          <TargetApplication
            isCustom={false}
            chaosEngine={chaosEngine}
            setChaosEngine={setChaosEngine}
          />
        );
      case 1:
        return <SteadyState />;
      default:
        return (
          <TargetApplication
            isCustom={false}
            chaosEngine={chaosEngine}
            setChaosEngine={setChaosEngine}
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

  // Redux state for handling Workflow Manifests
  const workflow = useActions(WorkflowActions);
  const manifest: WorkflowManifest = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const [chaosEngine, setChaosEngine] = useState(
    YAML.parse(manifest.engineYAML)
  );

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
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const stringifiedYAML = YAML.stringify(chaosEngine);
    workflow.setWorkflowManifest({
      engineYAML: stringifiedYAML,
    });

    // If Finish button is clicked,
    // Changes in the selected ChaosEngine will be
    // added to the main manifest and
    // the stepper will close
    if (activeStep === steps.length - 1) {
      const mainManifest = YAML.parse(manifest.manifest);
      mainManifest.spec.templates[
        experimentIndex
      ].inputs.artifacts[0].raw.data = manifest.engineYAML;
      workflow.setWorkflowManifest({
        manifest: YAML.stringify(mainManifest),
      });
      closeStepper();
    }
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
                {getStepContent(index, isCustom, chaosEngine, setChaosEngine)}
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
