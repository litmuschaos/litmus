import React from 'react';
import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import { StepIconProps } from '@material-ui/core/StepIcon';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline';
import ReliablityScore from '../Sections/Workflow/ReliabilityScore';
import ScheduleWorkflow from '../Sections/Workflow/ScheduleWorkflow';
import VerifyCommit from '../Sections/Workflow/VerifyCommit';
import ChooseAWorkflowCluster from '../Sections/Workflow/WorkflowCluster';
import QontoConnector from './quontoConnector';
import useStyles from './styles';
import useQontoStepIconStyles from './useQontoStepIconStyles';
import TuneWorkflow from '../Sections/Workflow/TuneWorkflow/index';
import ChooseWorkflow from '../Sections/Workflow/ChooseWorkflow/index';
import { WorkflowData, experimentMap } from '../../models/workflow';
import { RootState } from '../../redux/reducers';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';
import parsed from '../../utils/yamlUtils';
import Unimodal from '../../containers/layouts/Unimodal';

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

function getStepContent(
  stepIndex: number,
  gotoTuneWorkflow: () => void
): React.ReactNode {
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
      return <VerifyCommit goto={gotoTuneWorkflow} />;
    default:
      return <ChooseAWorkflowCluster />;
  }
}

const WorkflowStepper = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  // modal state and handlers
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const { yaml, weights } = workflowData;
  const workflow = useActions(WorkflowActions);

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if (activeStep === 2) {
      const tests = parsed(yaml);
      const arr: experimentMap[] = [];
      const hashMap = new Map();
      weights.forEach((weight) => {
        hashMap.set(weight.experimentName, weight.weight);
      });
      tests.forEach((test) => {
        let value = 0;
        if (hashMap.has(test)) {
          value = hashMap.get(test);
        }
        arr.push({ experimentName: test, weight: value });
      });
      workflow.setWorkflowDetails({
        weights: arr,
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const gotoTuneWorkflow = () => {
    setActiveStep(3);
  };

  return (
    <div className={classes.root}>
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
            <div>
              <Button
                variant="contained"
                color="primary"
                data-cy="selectModal"
                onClick={handleOpen}
              >
                Completed
              </Button>
              {/* FinishModal added */}
              <Unimodal
                isOpen={open}
                handleClose={handleClose}
                hasCloseBtn={false}
              >
                <div className={classes.rootContainer}>
                  <img
                    src="icons/finish.png"
                    className={classes.mark}
                    alt="mark"
                  />
                  <div className={classes.heading}>
                    A new chaos workflow,
                    <br />
                    <strong>was successfully created!</strong>
                  </div>
                  <div className={classes.headWorkflow}>
                    Congratulations on creating your first workflow! Now
                    information about <br /> it will be displayed on the main
                    screen of the application.
                  </div>
                  <div className={classes.button}>
                    <Button
                      variant="contained"
                      color="secondary"
                      data-cy="selectFinish"
                      onClick={handleClose}
                    >
                      Back to workflow
                    </Button>
                  </div>
                </div>
              </Unimodal>
            </div>
            <Typography className={classes.content}>
              All steps completed (display workflow completed modal here)
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <div className={classes.content}>
              {getStepContent(activeStep, gotoTuneWorkflow)}
            </div>

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

export default WorkflowStepper;
