import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import Center from '../../containers/layouts/Center';
import ButtonFilled from '../ButtonFilled';
import ButtonOutline from '../ButtonOutline';
import FinishModal from '../FinishModal';
import Loader from '../Loader';
import ReliablityScore from '../ReliabilityScore';
import WorkflowCluster from '../WorkflowCluster';
import ScheduleWorkflow from '../ScheduleWorkflow';
import VerifyCommit from '../VerifyCommit';
import useStyles from './styles';

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

function getStepContent(stepIndex: number): React.ReactNode {
  switch (stepIndex) {
    case 0:
      return <WorkflowCluster />;
    case 1:
      return <Loader />;
    case 2:
      return 'Show something random';
    case 3:
      return <ReliablityScore />;
    case 4:
      return <ScheduleWorkflow />;
    case 5:
      return <VerifyCommit />;
    default:
      return (
        <Center>
          <span style={{ height: '100px' }}>hello I&#39;m centered</span>
        </Center>
      );
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
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
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
                value="Back"
              />
              <ButtonFilled
                handleClick={handleNext}
                value={activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomStepper;
