import { useMutation } from '@apollo/client';
import Snackbar from '@material-ui/core/Snackbar';
import Step from '@material-ui/core/Step';
import { StepIconProps } from '@material-ui/core/StepIcon';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import Row from '../../containers/layouts/Row';
import { CREATE_WORKFLOW } from '../../graphql';
import {
  CreateWorkFlowInput,
  CreateWorkflowResponse,
  WeightMap,
} from '../../models/graphql/createWorkflowData';
import { WorkflowData } from '../../models/redux/workflow';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { validateWorkflowName } from '../../utils/validate';
import ChooseAWorkflowAgent from '../../views/CreateWorkflow/ChooseAWorkflowAgent';
import ChooseWorkflow from '../../views/CreateWorkflow/ChooseWorkflow/index';
import ReliablityScore from '../../views/CreateWorkflow/ReliabilityScore';
import ScheduleWorkflow from '../../views/CreateWorkflow/ScheduleWorkflow';
import TuneWorkflow from '../../views/CreateWorkflow/TuneWorkflow/index';
import VerifyCommit from '../../views/CreateWorkflow/VerifyCommit';
import WorkflowSettings from '../../views/CreateWorkflow/WorkflowSettings';
import QontoConnector from './quontoConnector';
import useStyles from './styles';
import useQontoStepIconStyles from './useQontoStepIconStyles';

interface ControlButtonProps {
  position: string;
}

interface AlertBoxProps {
  message: string;
}

function getSteps(): string[] {
  return [
    'Choose Agent',
    'Choose a workflow',
    'Workflow Settings',
    'Tune workflow',
    'Reliability score',
    'Schedule',
    'Verify and Commit',
  ];
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
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
      return <ChooseAWorkflowAgent />;
    case 1:
      return <ChooseWorkflow />;
    case 2:
      return <WorkflowSettings />;
    case 3:
      return <TuneWorkflow />;
    case 4:
      return <ReliablityScore />;
    case 5:
      return <ScheduleWorkflow />;
    case 6:
      return (
        <VerifyCommit isEditable gotoStep={(page: number) => gotoStep(page)} />
      );
    default:
      return <ChooseAWorkflowAgent />;
  }
}

const WorkflowStepper = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const {
    yaml,
    weights,
    description,
    isCustomWorkflow,
    cronSyntax,
    name,
    clusterid,
  } = workflowData;

  const defaultStep = isCustomWorkflow ? 2 : 0;

  const [activeStep, setActiveStep] = React.useState(defaultStep);
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [proceed, shouldProceed] = React.useState<boolean>(false);

  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const tabs = useActions(TabActions);
  const steps = getSteps();

  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) => (value ? shouldProceed(true) : shouldProceed(false)));
  }, [proceed]);

  const handleNext = () => {
    if (activeStep === 0 && clusterid === '') {
      // No Cluster has been selected and user clicked on Next
      setIsAlertOpen(true);
    } else if (activeStep === 1 && !proceed) {
      // If none of the workflow options (Choose Predefined, Create Custom,  ..)
      // are selected then do not proceed
      setIsAlertOpen(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const [open, setOpen] = React.useState(false);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [createChaosWorkFlow] = useMutation<
    CreateWorkflowResponse,
    CreateWorkFlowInput
  >(CREATE_WORKFLOW, {
    onCompleted: () => {
      setOpen(true);
    },
  });

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
      const yml = YAML.parse(yaml);
      const yamlJson = JSON.stringify(yml, null, 2); // Converted to Stringified JSON

      const chaosWorkFlowInputs = {
        workflow_manifest: yamlJson,
        cronSyntax,
        workflow_name: name,
        workflow_description: description,
        isCustomWorkflow,
        weightages: weightData,
        project_id: selectedProjectID,
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

  // Check correct permissions for user
  if (userRole === 'Viewer')
    return (
      <>
        <Typography
          variant="h3"
          align="center"
          style={{ marginTop: '10rem', marginBottom: '3rem' }}
        >
          {t(`schedule.missingPerm`)}
        </Typography>
        <Typography variant="h6" align="center">
          {t(`schedule.requiredPerm`)}
        </Typography>
        <br />
        <Typography variant="body1" align="center">
          {t(`schedule.contact`)}
        </Typography>

        {/* Back Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem',
          }}
        >
          <ButtonFilled onClick={() => history.goBack()}>Go Back</ButtonFilled>
        </div>
      </>
    );

  /** 
    Control Buttons
    ------------------------------------------------------------------------------
    When active step is zero (First Step) there won't be a Back button
    When active step is the last step in the stepper the button will change to Finish
    All steps in the middle will have next and back buttons
  * */

  const ControlButton: React.FC<ControlButtonProps> = ({ position }) => {
    return (
      <>
        {activeStep === 0 && position === 'top' ? ( // Only show Next button at Top for Step 0
          <ButtonFilled onClick={() => handleNext()}>Next</ButtonFilled>
        ) : activeStep === 0 && position !== 'top' ? ( // Don't show Next button at Bottom for Step 0
          <></>
        ) : activeStep === 1 &&
          window.screen.height < 1080 &&
          position !== 'top' ? (
          <></>
        ) : activeStep === steps.length - 1 ? ( // Show Finish button at Bottom for Last Step
          <ButtonFilled
            disabled={validateWorkflowName(name)}
            onClick={handleOpen}
          >
            Finish
          </ButtonFilled>
        ) : position === 'top' ? ( // Apply headerButtonWrapper style for top button's div
          <div className={classes.headerButtonWrapper} aria-label="buttons">
            <ButtonOutlined onClick={() => handleBack()}>Back</ButtonOutlined>
            <ButtonFilled onClick={() => handleNext()}>Next</ButtonFilled>
          </div>
        ) : (
          // Apply bottomButtonWrapper style for top button's div
          <div className={classes.bottomButtonWrapper} aria-label="buttons">
            <ButtonOutlined onClick={() => handleBack()}>Back</ButtonOutlined>
            <ButtonFilled onClick={() => handleNext()}>Next</ButtonFilled>
          </div>
        )}
      </>
    );
  };

  /** 
    Alert
    ------------------------------------------------------------------------------
    Displays a snackbar with the appropriate message whenever a condition is not satisfied
  * */

  const AlertBox: React.FC<AlertBoxProps> = ({ message }) => {
    return (
      <div>
        {isAlertOpen ? (
          <Snackbar
            open={isAlertOpen}
            autoHideDuration={6000}
            onClose={() => setIsAlertOpen(false)}
          >
            <Alert onClose={() => setIsAlertOpen(false)} severity="error">
              {message}
            </Alert>
          </Snackbar>
        ) : (
          <></>
        )}
      </div>
    );
  };

  function getAlertMessage(stepNumber: number) {
    switch (stepNumber) {
      case 0:
        return t(`workflowStepper.step1.errorSnackbar`);
      case 1:
        return t(`workflowStepper.step2.errorSnackbar`);
      default:
        return '';
    }
  }

  return (
    <div>
      {/* Alert */}
      <AlertBox message={getAlertMessage(activeStep)} />

      {/* Header */}
      <div className={classes.headWrapper}>
        <Row justifyContent="space-between">
          <Typography className={classes.header}>
            {t(`workflowStepper.scheduleNewChaosWorkflow`)}
          </Typography>
          <ControlButton position="top" />
        </Row>
      </div>
      <br />
      {/* Stepper */}
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
                <div
                  className={
                    i > activeStep
                      ? classes.normalLabel
                      : classes.completedLabel
                  }
                  data-cy="labelText"
                >
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
            <Modal
              open={open}
              onClose={handleClose}
              width="60%"
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              modalActions={
                <ButtonOutlined
                  className={classes.closeButton}
                  onClick={handleClose}
                >
                  &#x2715;
                </ButtonOutlined>
              }
            >
              <div className={classes.modal}>
                <img src="./icons/finish.svg" alt="mark" />
                <div className={classes.heading}>
                  {t('workflowStepper.aNewChaosWorkflow')}
                  <br />
                  <span className={classes.successful}>{name}</span>,
                  <br />
                  <strong>{t('workflowStepper.successful')}</strong>
                </div>
                <div className={classes.headWorkflow}>
                  {t('workflowStepper.congratulationsSub1')} <br />{' '}
                  {t('workflowStepper.congratulationsSub2')}
                </div>
                <div className={classes.button}>
                  <ButtonFilled
                    data-cy="selectFinish"
                    onClick={() => {
                      setOpen(false);
                      tabs.changeWorkflowsTabs(0);
                      history.push('/workflows');
                    }}
                  >
                    <div>{t('workflowStepper.workflowBtn')}</div>
                  </ButtonFilled>
                </div>
              </div>
            </Modal>
            {getStepContent(activeStep, (page: number) => gotoStep({ page }))}
          </div>
          {/* Control Buttons */}
          <div className={classes.bottomWrapper}>
            <ControlButton position="bottom" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepper;
