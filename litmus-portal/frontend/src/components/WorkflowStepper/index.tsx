import { useMutation } from '@apollo/client';
import Snackbar from '@material-ui/core/Snackbar';
import Step from '@material-ui/core/Step';
import { StepIconProps } from '@material-ui/core/StepIcon';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React from 'react';
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
import { experimentMap, WorkflowData } from '../../models/redux/workflow';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as TemplateSelectionActions from '../../redux/actions/template';
import * as WorkflowActions from '../../redux/actions/workflow';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { validateWorkflowName } from '../../utils/validate';
import { cronWorkflow, workflowOnce } from '../../utils/workflowTemplate';
import parsed from '../../utils/yamlUtils';
import ChooseWorkflow from '../../views/CreateWorkflow/ChooseWorkflow/index';
import ChooseAWorkflowAgent from '../../views/CreateWorkflow/ChooseAWorkflowAgent';
import ReliablityScore from '../../views/CreateWorkflow/ReliabilityScore';
import ScheduleWorkflow from '../../views/CreateWorkflow/ScheduleWorkflow';
import TuneWorkflow from '../../views/CreateWorkflow/TuneWorkflow/index';
import VerifyCommit from '../../views/CreateWorkflow/VerifyCommit';
import QontoConnector from './quontoConnector';
import useStyles from './styles';
import useQontoStepIconStyles from './useQontoStepIconStyles';

interface ControlButtonProps {
  position: string;
}

function getSteps(): string[] {
  return [
    'Choose Agent',
    'Choose a workflow',
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
      return <ChooseWorkflow isEditable />;
    case 2:
      return <TuneWorkflow />;
    case 3:
      return <ReliablityScore />;
    case 4:
      return <ScheduleWorkflow />;
    case 5:
      return (
        <VerifyCommit isEditable gotoStep={(page: number) => gotoStep(page)} />
      );
    default:
      return <ChooseAWorkflowAgent />;
  }
}

const CustomStepper = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const template = useActions(TemplateSelectionActions);
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
    scheduleType,
  } = workflowData;

  const defaultStep = isCustomWorkflow ? 2 : 0;

  const [activeStep, setActiveStep] = React.useState(defaultStep);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const isDisable = useSelector(
    (state: RootState) => state.selectTemplate.isDisable
  );
  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const tabs = useActions(TabActions);
  const workflow = useActions(WorkflowActions);
  // Might be used later
  const [invalidYaml, setinValidYaml] = React.useState(false); // eslint-disable-line
  const steps = getSteps();
  const scheduleOnce = workflowOnce;
  const scheduleMore = cronWorkflow;

  function EditYaml() {
    const oldParsedYaml = YAML.parse(yaml);
    const NewLink: string = ' ';
    if (
      oldParsedYaml.kind === 'Workflow' &&
      scheduleType.scheduleOnce !== 'now'
    ) {
      const oldParsedYaml = YAML.parse(yaml);
      const newParsedYaml = YAML.parse(scheduleMore);
      delete newParsedYaml.spec.workflowSpec;
      newParsedYaml.spec.schedule = cronSyntax;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = workflowData.name;
      newParsedYaml.metadata.namespace = workflowData.namespace;
      newParsedYaml.spec.workflowSpec = oldParsedYaml.spec;
      const timeZone = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      Object.entries(timeZone).forEach(([key, value]) => {
        newParsedYaml.spec[key] = value;
      });
      const NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowDetails({
        link: NewLink,
        yaml: NewYaml,
      });
    }
    if (
      oldParsedYaml.kind === 'CronWorkflow' &&
      scheduleType.scheduleOnce === 'now'
    ) {
      const oldParsedYaml = YAML.parse(yaml);
      const newParsedYaml = YAML.parse(scheduleOnce);
      delete newParsedYaml.spec;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = workflowData.name;
      newParsedYaml.metadata.namespace = workflowData.namespace;
      newParsedYaml.spec = oldParsedYaml.spec.workflowSpec;
      const NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowDetails({
        link: NewLink,
        yaml: NewYaml,
      });
    }
    if (
      oldParsedYaml.kind === 'CronWorkflow' &&
      scheduleType.scheduleOnce !== 'now'
    ) {
      const newParsedYaml = YAML.parse(yaml);
      newParsedYaml.spec.schedule = cronSyntax;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = workflowData.name;
      newParsedYaml.metadata.namespace = workflowData.namespace;
      const timeZone = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      Object.entries(timeZone).forEach(([key, value]) => {
        newParsedYaml.spec[key] = value;
      });
      const NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowDetails({
        link: NewLink,
        yaml: NewYaml,
      });
    }
  }

  const handleNext = () => {
    if (activeStep === 1) {
      workflow.setWorkflowDetails({ isBack: false });
    }
    if (activeStep === 2) {
      const tests = parsed(yaml);
      const arr: experimentMap[] = [];
      const hashMap = new Map();
      weights.forEach((weight) => {
        hashMap.set(weight.experimentName, weight.weight);
      });
      tests.forEach((test) => {
        let value = 10;
        if (hashMap.has(test)) {
          value = hashMap.get(test);
        }
        arr.push({ experimentName: test, weight: value });
      });
      if (arr.length === 0) {
        setinValidYaml(true);
      } else {
        const yamlData = YAML.parse(yaml);
        workflow.setWorkflowDetails({
          weights: arr,
          namespace: yamlData.metadata.namespace,
        });
        setinValidYaml(false);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else if (activeStep === 4) {
      EditYaml();
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else if (activeStep === 0 && clusterid === '') {
      setIsAlertOpen(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const [open, setOpen] = React.useState(false);

  const handleBack = () => {
    if (activeStep === 2) {
      workflow.setWorkflowDetails({ isBack: true });
    } else {
      workflow.setWorkflowDetails({ isBack: false });
    }
    if (activeStep === 2) {
      setinValidYaml(false);
    } else if (activeStep === 4 && isDisable === true) {
      template.selectTemplate({ isDisable: false });
    }
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
            <ButtonFilled onClick={() => handleNext()} disabled={isDisable}>
              Next
            </ButtonFilled>
          </div>
        ) : (
          // Apply bottomButtonWrapper style for top button's div
          <div className={classes.bottomButtonWrapper} aria-label="buttons">
            <ButtonOutlined onClick={() => handleBack()}>Back</ButtonOutlined>
            <ButtonFilled onClick={() => handleNext()} disabled={isDisable}>
              Next
            </ButtonFilled>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      {/* Alert */}
      {isAlertOpen ? (
        <Snackbar
          open={isAlertOpen}
          autoHideDuration={6000}
          onClose={() => setIsAlertOpen(false)}
        >
          <Alert onClose={() => setIsAlertOpen(false)} severity="error">
            {t(`workflowStepper.step1.errorSnackbar`)}
          </Alert>
        </Snackbar>
      ) : (
        <></>
      )}
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
                <img
                  src="./icons/finish.svg"
                  // className={classes.mark}
                  alt="mark"
                />
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

export default CustomStepper;
