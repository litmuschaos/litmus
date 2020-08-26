import React from 'react';
import Step from '@material-ui/core/Step';
import { StepIconProps } from '@material-ui/core/StepIcon';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import { useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
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
import { UserData } from '../../models/user';
import { RootState } from '../../redux/reducers';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';
import parsed from '../../utils/yamlUtils';
import { CREATE_WORKFLOW } from '../../graphql';
import Unimodal from '../../containers/layouts/Unimodal';
import { history } from '../../redux/configureStore';

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

interface WeightMap {
  experiment_name: string;
  weightage: number;
}

function QontoStepIcon(props: StepIconProps) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  if (completed) {
    return (
      <div
        className={`${classes.root} ${
          active ? classes.active : classes.completed
        }`}
      >
        <img src="./icons/NotPass.png" alt="Not Completed Icon" />
      </div>
    );
  }
  if (active) {
    return (
      <div
        className={`${classes.root} ${
          active ? classes.active : classes.completed
        }`}
      >
        <div className={classes.circle} />
      </div>
    );
  }
  return (
    <div
      className={`${classes.root} ${
        active ? classes.active : classes.completed
      }`}
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
  gotoStep: (page: number) => void
): React.ReactNode {
  switch (stepIndex) {
    case 0:
      return (
        <ChooseAWorkflowCluster gotoStep={(page: number) => gotoStep(page)} />
      );
    case 1:
      return <ChooseWorkflow />;
    case 2:
      return <TuneWorkflow />;
    case 3:
      return <ReliablityScore />;
    case 4:
      return <ScheduleWorkflow />;
    case 5:
      return <VerifyCommit gotoStep={(page: number) => gotoStep(page)} />;
    default:
      return (
        <ChooseAWorkflowCluster gotoStep={(page: number) => gotoStep(page)} />
      );
  }
}

const CustomStepper = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const {
    yaml,
    weights,
    description,
    isCustomWorkflow,
    name,
    clusterid,
  } = workflowData;

  const userData: UserData = useSelector((state: RootState) => state.userData);

  const { projectID } = userData;

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

  const [open, setOpen] = React.useState(false);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [createChaosWorkFlow] = useMutation(CREATE_WORKFLOW);

  const handleMutation = () => {
    if (name.length !== 0 && description.length !== 0 && weights.length !== 0) {
      const weightData: WeightMap[] = [];

      weights.forEach((data) => {
        weightData.push({
          experiment_name: data.experimentName,
          weightage: data.weight,
        });
      });

      /* JSON.stringify takes 3 parameters [object to be converted,
      a function to alter the conversion, spaces to be shown in final result for indentation ] */
      const yamlJson = JSON.stringify(yaml, null, 2);

      const chaosWorkFlowInputs = {
        workflow_manifest: yamlJson,
        cronSyntax: '',
        workflow_name: name,
        workflow_description: description,
        isCustomWorkflow,
        weightages: weightData,
        project_id: projectID,
        cluster_id: clusterid,
      };
      createChaosWorkFlow({
        variables: { ChaosWorkFlowInput: chaosWorkFlowInputs },
      });
    }
  };

  const handleOpen = () => {
    handleMutation();
    setOpen(true);
  };

  const handleClose = () => {
    history.push('/workflows');
    setOpen(false);
  };

  function gotoStep({ page }: { page: number }) {
    setActiveStep(page);
  }

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
        <div>
          <div>
            <Unimodal
              isOpen={open}
              handleClose={handleClose}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              hasCloseBtn={false}
            >
              <div className={classes.content}>
                <img
                  src="icons/finish.svg"
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
                  <ButtonFilled
                    isPrimary
                    data-cy="selectFinish"
                    handleClick={() => {
                      history.push('/workflows');
                      setOpen(false);
                    }}
                  >
                    <div>Back to workflow</div>
                  </ButtonFilled>
                </div>
              </div>
            </Unimodal>
            {getStepContent(activeStep, (page: number) => gotoStep({ page }))}
          </div>

          {/* Control Buttons */}
          {activeStep !== 0 ? (
            <div className={classes.buttonGroup}>
              <ButtonOutline isDisabled={false} handleClick={handleBack}>
                <Typography>Back</Typography>
              </ButtonOutline>
              {activeStep === steps.length - 1 ? (
                <ButtonFilled handleClick={handleOpen} isPrimary>
                  <div>Finish</div>
                </ButtonFilled>
              ) : (
                <ButtonFilled handleClick={() => handleNext()} isPrimary>
                  <div>
                    Next
                    <img
                      alt="next"
                      src="icons/nextArrow.svg"
                      className={classes.nextArrow}
                    />
                  </div>
                </ButtonFilled>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomStepper;
