import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LitmusStepper } from '../../../../components/LitmusStepper';
import Loader from '../../../../components/Loader';
import Row from '../../../../containers/layouts/Row';
import { DashboardDetails } from '../../../../models/dashboardsData';
import { ListDataSourceResponse } from '../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../redux/actions';
import * as AlertActions from '../../../../redux/actions/alert';
import { RootState } from '../../../../redux/reducers';
import { getProjectRole } from '../../../../utils/getSearchParams';
import ChooseADashboardType from '../Steps/ChooseADashboardType';
import ConfigureDashboardMetadata from '../Steps/ConfigureDashboardMetadata';
import SelectTheMetrics from '../Steps/SelectTheMetrics';
import TuneTheQueries from '../Steps/TuneTheQueries';
import useStyles from './styles';

interface ChildRef {
  onNext: () => void;
}

interface AlertBoxProps {
  message: string;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface DashboardStepperProps {
  configure: boolean;
  activePanelID: string;
  existingDashboardVars: DashboardDetails;
  dataSourceList: ListDataSourceResponse[];
}

const DashboardStepper: React.FC<DashboardStepperProps> = ({
  configure,
  activePanelID,
  existingDashboardVars,
  dataSourceList,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const stepsArray: string[] = [
    `${t('analyticsDashboard.applicationDashboards.stepper.steps.step1')}`,
    `${t('analyticsDashboard.applicationDashboards.stepper.steps.step2')}`,
    `${t('analyticsDashboard.applicationDashboards.stepper.steps.step3')}`,
    `${t('analyticsDashboard.applicationDashboards.stepper.steps.step4')}`,
  ];
  const childRef = useRef<ChildRef>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState<number>(
    configure && activePanelID !== '' ? 1 : 0
  );
  const [dashboardVars, setDashboardVars] = React.useState<DashboardDetails>({
    id: !configure ? '' : existingDashboardVars.id ?? '',
    name: !configure ? '' : existingDashboardVars.name ?? '',
    dashboardTypeID: !configure
      ? ''
      : existingDashboardVars.dashboardTypeID ?? '',
    dashboardTypeName: !configure
      ? ''
      : existingDashboardVars.dashboardTypeName ?? '',
    dataSourceType: !configure
      ? ''
      : existingDashboardVars.dataSourceType ?? '',
    dataSourceID: !configure
      ? dataSourceList.length !== 0
        ? dataSourceList[0].ds_id
        : ''
      : existingDashboardVars.dataSourceID ?? '',
    dataSourceURL: !configure
      ? dataSourceList.length !== 0
        ? dataSourceList[0].ds_url
        : ''
      : existingDashboardVars.dataSourceURL ?? '',
    chaosEventQueryTemplate: !configure
      ? ''
      : existingDashboardVars.chaosEventQueryTemplate ?? '',
    chaosVerdictQueryTemplate: !configure
      ? ''
      : existingDashboardVars.chaosVerdictQueryTemplate ?? '',
    agentID: !configure ? '' : existingDashboardVars.agentID ?? '',
    information: !configure ? '' : existingDashboardVars.information ?? '',
    panelGroupMap: !configure ? [] : existingDashboardVars.panelGroupMap ?? [],
    panelGroups: !configure ? [] : existingDashboardVars.panelGroups ?? [],
    selectedPanelGroupMap: [],
    applicationMetadataMap: !configure
      ? []
      : existingDashboardVars.applicationMetadataMap ?? [],
  });
  const [disabledNext, setDisabledNext] = React.useState<boolean>(true);
  let steps = stepsArray;
  if (configure) {
    steps = steps.filter(
      (step: string) =>
        step !==
          `${t(
            'analyticsDashboard.applicationDashboards.stepper.steps.step1'
          )}` &&
        step !==
          `${t('analyticsDashboard.applicationDashboards.stepper.steps.step3')}`
    );
  } else if (dashboardVars.dashboardTypeID === 'custom') {
    steps = steps.filter(
      (step: string) =>
        step !==
        `${t('analyticsDashboard.applicationDashboards.stepper.steps.step3')}`
    );
  }
  // Checks if the button is in loading state or not
  const isButtonLoading = (status: boolean) => setLoading(status);
  const handleNext = () => {
    if (childRef.current && childRef.current.onNext()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  function getStepContent(
    stepIndex: number,
    childRef: React.MutableRefObject<ChildRef | undefined>
  ): React.ReactNode {
    switch (stepIndex) {
      case !configure ? 0 : -1:
        return <ChooseADashboardType ref={childRef} handleNext={handleNext} />;
      case !configure ? 1 : 0:
        return (
          <ConfigureDashboardMetadata
            ref={childRef}
            configure={configure}
            dashboardVars={dashboardVars}
            dataSourceList={dataSourceList}
            handleMetadataUpdate={(dashboardMetadata: DashboardDetails) => {
              setDashboardVars({
                ...dashboardVars,
                id: dashboardMetadata.id ?? '',
                name: dashboardMetadata.name ?? '',
                dashboardTypeID: dashboardMetadata.dashboardTypeID ?? '',
                dashboardTypeName: dashboardMetadata.dashboardTypeName ?? '',
                dataSourceType: dashboardMetadata.dataSourceType ?? '',
                dataSourceID: dashboardMetadata.dataSourceID ?? '',
                dataSourceURL: dashboardMetadata.dataSourceURL ?? '',
                chaosEventQueryTemplate:
                  dashboardMetadata.chaosEventQueryTemplate ?? '',
                chaosVerdictQueryTemplate:
                  dashboardMetadata.chaosVerdictQueryTemplate ?? '',
                agentID: dashboardMetadata.agentID ?? '',
                information: dashboardMetadata.information ?? '',
                panelGroupMap: dashboardMetadata.panelGroupMap ?? [],
                panelGroups: dashboardMetadata.panelGroups ?? [],
                applicationMetadataMap:
                  dashboardMetadata.applicationMetadataMap ?? [],
              });
            }}
            setDisabledNext={(next: boolean) => {
              setDisabledNext(next);
            }}
          />
        );
      case !configure
        ? dashboardVars.dashboardTypeID !== 'custom'
          ? 2
          : -1
        : -1:
        return (
          <SelectTheMetrics
            ref={childRef}
            dashboardVars={dashboardVars}
            handleMetricsUpdate={(dashboardMetrics: DashboardDetails) => {
              setDashboardVars({
                ...dashboardVars,
                selectedPanelGroupMap:
                  dashboardMetrics.selectedPanelGroupMap ?? [],
              });
            }}
            setDisabledNext={(next: boolean) => {
              setDisabledNext(next);
            }}
          />
        );
      case !configure
        ? dashboardVars.dashboardTypeID !== 'custom'
          ? 3
          : 2
        : 1:
        return (
          <TuneTheQueries
            ref={childRef}
            configure={configure}
            isLoading={isButtonLoading}
            activeEditPanelID={activePanelID}
            dashboardVars={dashboardVars}
          />
        );
      default:
        return <ChooseADashboardType ref={childRef} handleNext={handleNext} />;
    }
  }

  const isAlertOpen = useSelector(
    (state: RootState) => state.alert.isAlertOpen
  );
  const alert = useActions(AlertActions);
  const handleBack = () => {
    if (activeStep === 1 && !configure) {
      setDashboardVars({
        id: '',
        name: '',
        dashboardTypeID: '',
        dashboardTypeName: '',
        dataSourceType: '',
        dataSourceID: '',
        dataSourceURL: '',
        chaosEventQueryTemplate: '',
        chaosVerdictQueryTemplate: '',
        agentID: '',
        information: '',
        panelGroupMap: [],
        panelGroups: [],
        selectedPanelGroupMap: [],
        applicationMetadataMap: [],
      });
    }
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
      <>
        {activeStep === steps.length - 1 ? ( // Show Save changes button at Bottom for Last Step
          <div
            className={classes.headerButtonWrapper}
            aria-label="buttons"
            style={{ width: 'fit-content' }}
          >
            {!loading && (
              <ButtonOutlined
                onClick={() => handleBack()}
                style={{ marginRight: '1rem' }}
              >
                <Typography>
                  {t(
                    'analyticsDashboard.applicationDashboards.stepper.buttons.back'
                  )}
                </Typography>
              </ButtonOutlined>
            )}
            <ButtonFilled disabled={loading} onClick={() => handleNext()}>
              {!loading && (
                <img
                  src="./icons/save-changes.svg"
                  alt="Info icon"
                  className={classes.icon}
                />
              )}
              <Typography className={classes.buttonText}>
                {!loading
                  ? `${t(
                      'analyticsDashboard.applicationDashboards.stepper.buttons.saveChanges'
                    )}`
                  : configure
                  ? `${t(
                      'analyticsDashboard.applicationDashboards.stepper.buttons.status.updating'
                    )}`
                  : `${t(
                      'analyticsDashboard.applicationDashboards.stepper.buttons.status.creating'
                    )}`}
              </Typography>
              {loading && <Loader size={20} />}
            </ButtonFilled>
          </div>
        ) : (activeStep !== 0 && !configure) ||
          (activeStep === 0 && configure) ? ( // Apply headerButtonWrapper style for top button's div
          <div className={classes.headerButtonWrapper} aria-label="buttons">
            {!(activeStep === 0 && configure) && (
              <ButtonOutlined
                onClick={() => handleBack()}
                style={{ marginRight: '1rem' }}
              >
                <Typography>
                  {t(
                    'analyticsDashboard.applicationDashboards.stepper.buttons.back'
                  )}
                </Typography>
              </ButtonOutlined>
            )}
            <ButtonFilled onClick={() => handleNext()} disabled={disabledNext}>
              <Typography>
                {t(
                  'analyticsDashboard.applicationDashboards.stepper.buttons.next'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        ) : (
          <></>
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
            onClose={() => alert.changeAlertState(false)}
          >
            <Alert
              onClose={() => alert.changeAlertState(false)}
              severity="error"
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
      case !configure ? 0 : -1:
        if (getProjectRole() === 'Viewer') {
          return t(
            'analyticsDashboard.applicationDashboards.stepper.errors.step1.messageViewer'
          );
        }
        return t(
          'analyticsDashboard.applicationDashboards.stepper.errors.step1.message'
        );
      case !configure ? 1 : 0:
        return t(
          'analyticsDashboard.applicationDashboards.stepper.errors.step2.messageViewer'
        );
      case !configure
        ? dashboardVars.dashboardTypeID !== 'custom'
          ? 2
          : -1
        : -1:
        return t(
          'analyticsDashboard.applicationDashboards.stepper.errors.step3.message'
        );
      case !configure
        ? dashboardVars.dashboardTypeID !== 'custom'
          ? 3
          : 2
        : 1:
        return configure
          ? t(
              'analyticsDashboard.applicationDashboards.stepper.errors.step4.messageConfigure'
            )
          : t(
              'analyticsDashboard.applicationDashboards.stepper.errors.step4.messageCreate'
            );
      default:
        return '';
    }
  }

  useEffect(() => {
    if (configure) {
      setDashboardVars({
        ...existingDashboardVars,
      });
    }
  }, [existingDashboardVars]);

  return (
    <div className={classes.root}>
      {/* Alert */}
      <AlertBox message={getAlertMessage(activeStep)} />

      {/* Header */}
      <div className={classes.headWrapper}>
        <Row justifyContent="space-between">
          <Typography className={classes.header}>
            {!configure
              ? t('analyticsDashboard.applicationDashboards.createHeader')
              : `${t(
                  'analyticsDashboard.applicationDashboards.configureHeader'
                )} / ${dashboardVars.name}`}
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
        hideNext={!configure ? !activeStep : false}
        disableNext={
          configure && activeStep === steps.length - 1 ? loading : disabledNext
        }
        handleNext={() => handleNext()}
        finishAction={() => {}}
        finishButtonText={
          <>
            {!loading && (
              <img
                src="./icons/save-changes.svg"
                alt="Info icon"
                className={classes.icon}
              />
            )}
            <Typography>
              {!loading
                ? `${t(
                    'analyticsDashboard.applicationDashboards.stepper.buttons.saveChanges'
                  )}`
                : configure
                ? `${t(
                    'analyticsDashboard.applicationDashboards.stepper.buttons.status.updating'
                  )}`
                : `${t(
                    'analyticsDashboard.applicationDashboards.stepper.buttons.status.creating'
                  )}`}
            </Typography>
          </>
        }
      >
        {getStepContent(activeStep, childRef)}
      </LitmusStepper>
    </div>
  );
};

export default DashboardStepper;
