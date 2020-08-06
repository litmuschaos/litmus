import React from 'react';
import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import { StepIconProps } from '@material-ui/core/StepIcon';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline';
import FinishModal from '../FinishModal';
import ReliablityScore from '../ReliabilityScore';
import ScheduleWorkflow from '../ScheduleWorkflow';
import VerifyCommit from '../VerifyCommit';
import ChooseAWorkflowCluster from '../WorkflowCluster';
import QontoConnector from './quontoConnector';
import useStyles from './styles';
import useQontoStepIconStyles from './useQontoStepIconStyles';
import TuneWorkflow from '../TuneWorkflow/index';
import ChooseWorkflow from '../ChooseWorkflow/index';

function getSteps(): string[] {
  return [
    'Target Cluster',
    'Choose a workflow',
    'Tune workflow',
    'Reliability score',
    'Schedule',
    'Verify and Commit',
  ];
}

function QontoStepIcon(props: StepIconProps) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  if (completed) {
    return (
      <div
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.completed]: completed,
        })}
      >
        <img src="./icons/NotPass.png" alt="Not Completed Icon" />
      </div>
    );
  }
  if (active) {
    return (
      <div
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.completed]: completed,
        })}
      >
        <div className={classes.circle} />
      </div>
    );
  }
  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {/* <img src="./icons/workflowNotActive.svg" /> */}
      <div className={classes.outerCircle}>
        <div className={classes.innerCircle} />
      </div>
    </div>
  );
}

function getStepContent(stepIndex: number): React.ReactNode {
  switch (stepIndex) {
    case 0:
      return <ChooseAWorkflowCluster />;
    case 1:
      return <ChooseWorkflow />;
    case 2:
      return <TuneWorkflow />;
    case 3:
      return <ReliablityScore />;
    case 4:
      return <ScheduleWorkflow />;
    case 5:
      return <VerifyCommit />;
    default:
      return <ChooseAWorkflowCluster />;
  }
}

const CustomStepper = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.workflowHeader}>
        Schedule a new <strong>chaos workflow</strong>
      </Typography>
      <Stepper
        activeStep={activeStep}
        connector={<QontoConnector />}
        className={classes.stepper}
        alternativeLabel
      >
        {steps.map((label, i) => (
          <Step key={label}>
            {activeStep === i ? (
              <StepLabel StepIconComponent={QontoStepIcon}>
                <div className={classes.activeLabel} data-cy="labelText">
                  {label}
                </div>
              </StepLabel>
            ) : (
              <StepLabel StepIconComponent={QontoStepIcon}>
                <div className={classes.normalLabel} data-cy="labelText">
                  {label}
                </div>
              </StepLabel>
            )}
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <FinishModal />
            <Typography className={classes.content}>
              All steps completed (display workflow completed modal here)
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <div className={classes.content}>{getStepContent(activeStep)}</div>

            {/* Control Buttons */}
            <div className={classes.buttonGroup}>
              <ButtonOutline
                isDisabled={activeStep === 0}
                handleClick={handleBack}
              >
                <Typography>Back</Typography>
              </ButtonOutline>
              <ButtonFilled handleClick={handleNext} isPrimary>
                {activeStep === steps.length - 1 ? (
                  <div>Finish</div>
                ) : (
                  <div>
                    Next{' '}
                    <img
                      alt="next"
                      src="icons/nextArrow.svg"
                      className={classes.nextArrow}
                    />
                  </div>
                )}
              </ButtonFilled>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomStepper;
