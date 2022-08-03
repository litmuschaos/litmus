import { Tooltip } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import localforage from 'localforage';
import React, { lazy, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Row from '../../containers/layouts/Row';
import useActions from '../../redux/actions';
import * as AlertActions from '../../redux/actions/alert';
import { RootState } from '../../redux/reducers';
import { getProjectRole } from '../../utils/getSearchParams';
import { LitmusStepper } from '../LitmusStepper';
import Loader from '../Loader';
import { SuspenseLoader } from '../SuspenseLoader';
import useStyles from './styles';

const ChooseAWorkflowAgent = lazy(
  () => import('../../views/CreateWorkflow/ChooseAWorkflowAgent')
);

const ChooseWorkflow = lazy(
  () => import('../../views/CreateWorkflow/ChooseWorkflow/index')
);

const ReliablityScore = lazy(
  () => import('../../views/CreateWorkflow/ReliabilityScore')
);

const ScheduleWorkflow = lazy(
  () => import('../../views/CreateWorkflow/ScheduleWorkflow')
);

const TuneWorkflow = lazy(
  () => import('../../views/CreateWorkflow/TuneWorkflow/index')
);

const VerifyCommit = lazy(
  () => import('../../views/CreateWorkflow/VerifyCommit')
);

const WorkflowSettings = lazy(
  () => import('../../views/CreateWorkflow/WorkflowSettings')
);

interface ControlButtonProps {
  position: string;
}

interface ChildRef {
  onNext: () => void;
}

interface AlertBoxProps {
  message: string;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const WorkflowStepper = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const childRef = useRef<ChildRef>();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState(0);

  // Checks if the button is in loading state or not
  const isButtonLoading = (status: boolean) => setLoading(status);

  // Set the active step to the page props
  const goToStep = (page: number) => setActiveStep(page);

  function getStepContent(
    stepIndex: number,
    childRef: React.MutableRefObject<ChildRef | undefined>,
    isWorkflowUploaded: boolean
  ): React.ReactNode {
    if (isWorkflowUploaded) {
      switch (stepIndex) {
        case 0:
          return <ChooseAWorkflowAgent ref={childRef} />;
        case 1:
          return <ChooseWorkflow ref={childRef} />;
        case 2:
          return <WorkflowSettings ref={childRef} />;
        case 3:
          return <ScheduleWorkflow ref={childRef} />;
        case 4:
          return (
            <VerifyCommit
              isLoading={isButtonLoading}
              handleGoToStep={goToStep}
              ref={childRef}
            />
          );
        default:
          return <ChooseAWorkflowAgent ref={childRef} />;
      }
    } else {
      switch (stepIndex) {
        case 0:
          return <ChooseAWorkflowAgent ref={childRef} />;
        case 1:
          return <ChooseWorkflow ref={childRef} />;
        case 2:
          return <WorkflowSettings ref={childRef} />;
        case 3:
          return <TuneWorkflow ref={childRef} />;
        case 4:
          return <ReliablityScore ref={childRef} />;
        case 5:
          return <ScheduleWorkflow ref={childRef} />;
        case 6:
          return (
            <VerifyCommit
              isLoading={isButtonLoading}
              handleGoToStep={goToStep}
              ref={childRef}
            />
          );
        default:
          return <ChooseAWorkflowAgent ref={childRef} />;
      }
    }
  }

  const [proceed, shouldProceed] = React.useState<boolean>(false);

  const isAlertOpen = useSelector(
    (state: RootState) => state.alert.isAlertOpen
  );
  const isWorkflowUploaded = useSelector(
    (state: RootState) => state.workflowManifest.isUploaded
  );
  const steps: string[] = isWorkflowUploaded
    ? [
        'Choose Chaos Delegate',
        'Choose a Chaos Scenario',
        'Chaos Scenario Settings',
        'Schedule',
        'Verify and Commit',
      ]
    : [
        'Choose Chaos Delegate',
        'Choose a Chaos Scenario',
        'Chaos Scenario Settings',
        'Tune Chaos Scenario',
        'Reliability score',
        'Schedule',
        'Verify and Commit',
      ];
  const alert = useActions(AlertActions);

  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) => (value ? shouldProceed(true) : shouldProceed(false)));
  }, [proceed]);

  const handleNext = () => {
    if (childRef.current && childRef.current.onNext()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /** 
    Control Buttons
    ------------------------------------------------------------------------------
    When active step is zero (First Step) there won't be a Back button
    When active step is the last step in the stepper the button will change to Finish
    All steps in the middle will have next and back buttons
  * */

  const ControlButton: React.FC = () => {
    return (
      <div data-cy="ControlButtons">
        {activeStep === 0 ? ( // Only show Next button at Top for Step 0
          <ButtonFilled className={classes.btn} onClick={() => handleNext()}>
            Next
          </ButtonFilled>
        ) : activeStep === steps.length - 1 ? ( // Show Finish button at Bottom for Last Step
          loading ? (
            <ButtonFilled
              className={classes.btn}
              disabled
              onClick={() => handleNext()}
            >
              Finish <span style={{ marginLeft: '0.5rem' }} />{' '}
              <Loader size={20} />
            </ButtonFilled>
          ) : (
            <ButtonFilled className={classes.btn} onClick={() => handleNext()}>
              Finish
            </ButtonFilled>
          )
        ) : activeStep === 2 ? (
          <div className={classes.headerButtonWrapper} aria-label="buttons">
            <Tooltip
              title="All selected Chaos Scenario Data will be lost"
              placement="top"
              leaveDelay={300}
            >
              <div>
                <ButtonOutlined
                  className={classes.btn}
                  onClick={() => handleBack()}
                >
                  Back
                </ButtonOutlined>
              </div>
            </Tooltip>
            <ButtonFilled className={classes.btn} onClick={() => handleNext()}>
              Next
            </ButtonFilled>
          </div>
        ) : (
          // Apply headerButtonWrapper style for top button's div
          <div className={classes.headerButtonWrapper} aria-label="buttons">
            <ButtonOutlined
              className={classes.btn}
              onClick={() => handleBack()}
            >
              Back
            </ButtonOutlined>
            <ButtonFilled className={classes.btn} onClick={() => handleNext()}>
              Next
            </ButtonFilled>
          </div>
        )}
      </div>
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
            onClose={() => alert.changeAlertState(false)}
          >
            <Alert
              onClose={() => alert.changeAlertState(false)}
              severity="error"
              data-cy="AlertBox"
            >
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
        if (getProjectRole() === 'Viewer') {
          return t(`workflowStepper.step1.errorSnackbarViewer`);
        }
        return t(`workflowStepper.step1.errorSnackbar`);

      case 1:
        return t(`workflowStepper.step2.errorSnackbar`);
      case 2:
        return t(`workflowStepper.step3.errorSnackbar`);
      case 3:
        return t(`workflowStepper.step4.errorSnackbar`);
      case 5:
        return t(`workflowStepper.step5.errorSnackbar`);
      case 6:
        return t(`workflowStepper.step6.errorSnackbar`);
      default:
        return '';
    }
  }

  return (
    <div className={classes.root}>
      {/* Alert */}
      <AlertBox message={getAlertMessage(activeStep)} />

      {/* Header */}
      <div className={classes.headWrapper}>
        <Row justifyContent="space-between">
          <Typography className={classes.header}>
            {t(`workflowStepper.scheduleNewChaosWorkflow`)}
          </Typography>
          <ControlButton />
        </Row>
      </div>
      <br />
      {/* Stepper */}
      <LitmusStepper
        steps={steps}
        activeStep={activeStep}
        handleBack={handleBack}
        loader={loading}
        handleNext={() => handleNext()}
        finishAction={() => {}}
      >
        <SuspenseLoader style={{ height: '50vh' }}>
          {getStepContent(activeStep, childRef, isWorkflowUploaded)}
        </SuspenseLoader>
      </LitmusStepper>
    </div>
  );
};

export default WorkflowStepper;
