import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import { ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { RootState } from '../../../../redux/reducers';
import AdvanceEngineTuning from '../TuneWorkflowSteps/AdvanceEngineTune';
import EnvironmentVariables from '../TuneWorkflowSteps/EnvironmentVariables';
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
  closeStepper: () => void,
  infraEngine: boolean
): React.ReactNode {
  if (infraEngine) {
    switch (step) {
      case 0:
        return <SteadyState infra={infraEngine} gotoStep={gotoStep} />;
      case 1:
        return <EnvironmentVariables infra={infraEngine} gotoStep={gotoStep} />;
      case 2:
        return (
          <AdvanceEngineTuning
            engineIndex={engineIndex}
            infra={infraEngine}
            gotoStep={gotoStep}
            closeStepper={closeStepper}
          />
        );
      default:
        return <TargetApplication gotoStep={gotoStep} />;
    }
  } else {
    switch (step) {
      case 0:
        return <TargetApplication gotoStep={gotoStep} />;
      case 1:
        return <SteadyState infra={infraEngine} gotoStep={gotoStep} />;
      case 2:
        return <EnvironmentVariables infra={infraEngine} gotoStep={gotoStep} />;
      case 3:
        return (
          <AdvanceEngineTuning
            engineIndex={engineIndex}
            infra={infraEngine}
            gotoStep={gotoStep}
            closeStepper={closeStepper}
          />
        );
      default:
        return <TargetApplication gotoStep={gotoStep} />;
    }
  }
}

const ConfigurationStepper: React.FC<ConfigurationStepperProps> = ({
  experimentIndex,
  closeStepper,
  isCustom,
}) => {
  const classes = useStyles();

  const engine = useSelector(
    (state: RootState) => state.workflowManifest.engineYAML
  );
  const [infraEngine, setInfraEngine] = useState(false);

  useEffect(() => {
    const parsedEngine = YAML.parse(engine);
    if (!parsedEngine?.spec?.appinfo) {
      setInfraEngine(true);
    }
  }, []);

  // State variable to handle Stepper Steps
  const [activeStep, setActiveStep] = React.useState(0);

  // Steps of stepper for custom and predefined workflows
  const steps = infraEngine
    ? [
        'Define the steady state for this application',
        'Tune Chaos Experiment',
        'Advance ChaosEngine Configuration',
      ]
    : [
        'Target Application',
        'Define the steady state for this application',
        'Tune Chaos Experiment',
        'Advance ChaosEngine Configuration',
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
                  closeStepper,
                  infraEngine
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
