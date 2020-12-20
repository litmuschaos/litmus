/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-loop-func */
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_LIST_DETAILS } from '../../graphql';
import { ChaosData, ExecutionData } from '../../models/graphql/workflowData';
import {
  WeightageMap,
  WorkflowList,
  WorkflowListDataVars,
} from '../../models/graphql/workflowListData';
import { RootState } from '../../redux/reducers';
import PopOver from '../../views/ChaosWorkflows/BrowseAnalytics/PopOver';
import WorkflowDetailsTable from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowRunDetailsTable';
import WorkflowRunsBarChart from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowRunsBarChart';
import useStyles from './styles';

interface WorkflowRunData {
  testsPassed: number;
  testsFailed: number;
  resilienceScore: number;
  testDate: string;
  workflowRunID: string;
  workflowID: string;
}

interface SelectedWorkflowRunData {
  testsPassed: number;
  testsFailed: number;
  resilienceScore: number;
  testDate: string;
  xLoc: number;
  yLoc: number;
  workflowRunID: string;
}

interface WorkFlowTests {
  test_id: number;
  test_name: string;
  test_result: string;
  test_weight: number;
  resulting_points: number;
  last_run: string;
}

const AnalyticsPage: React.FC = () => {
  const classes = useStyles();
  const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false);
  const [workflowRunPresent, setWorkflowRunPresent] = React.useState<boolean>(
    true
  );
  const { pathname } = useLocation();
  // Getting the workflow nome from the pathname
  const workflowId = pathname.split('/')[3];
  const { t } = useTranslation();
  const [selectedWorkflowRunID, setSelectedWorkflowRunID] = React.useState<
    string
  >('');
  const [
    selectedWorkflowRunDetails,
    setSelectedWorkflowRunDetails,
  ] = React.useState<WorkFlowTests[]>();
  const [workflowRunDataForPlot, setWorkflowRunDataForPlot] = React.useState<
    WorkflowRunData[]
  >([]);
  const [selectedWorkflowRunData, setSelectedWorkflowRunData] = React.useState<
    SelectedWorkflowRunData
  >({
    testsPassed: 0,
    testsFailed: 0,
    resilienceScore: 0,
    testDate: '',
    xLoc: 0,
    yLoc: 0,
    workflowRunID: '',
  });

  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Apollo query to get the scheduled workflow data
  const { data, error } = useQuery<WorkflowList, WorkflowListDataVars>(
    WORKFLOW_LIST_DETAILS,
    {
      pollInterval: 50,
      variables: { projectID: selectedProjectID, workflowIDs: [] },
    }
  );

  const setPopOverDisplay = (
    selectedWorkflowRunDetails: SelectedWorkflowRunData,
    visible: boolean
  ) => {
    setSelectedWorkflowRunData(selectedWorkflowRunDetails);
    setPopoverOpen(visible);
  };

  useEffect(() => {
    const workflowRuns: WorkflowRunData[] = [];
    const experimentTestResultsArray: number[] = [];
    const chaosDataArray: ChaosData[] = [];
    const validWorkflowRunsData: WorkflowRunData[] = [];
    try {
      const selectedWorkflowSchedule = data?.ListWorkflow.filter(
        (w) => w.workflow_id === workflowId
      );
      const selectedWorkflows = selectedWorkflowSchedule
        ? selectedWorkflowSchedule[0].workflow_runs
        : [];
      selectedWorkflows?.forEach((data) => {
        try {
          const executionData: ExecutionData = JSON.parse(data.execution_data);
          const { nodes } = executionData;
          const experimentTestResultsArrayPerWorkflowRun: number[] = [];
          let weightsSum: number = 0;
          let isValid: boolean = false;
          let totalExperimentsPassed: number = 0;
          for (const key of Object.keys(nodes)) {
            const node = nodes[key];
            if (node.chaosData) {
              const { chaosData } = node;
              chaosDataArray.push(chaosData);
              if (
                chaosData.experimentVerdict === 'Pass' ||
                chaosData.experimentVerdict === 'Fail'
              ) {
                const weightageMap: WeightageMap[] = selectedWorkflowSchedule
                  ? selectedWorkflowSchedule[0].weightages
                  : [];
                weightageMap.forEach((weightage) => {
                  if (weightage.experiment_name === chaosData.experimentName) {
                    if (chaosData.experimentVerdict === 'Pass') {
                      experimentTestResultsArray.push(weightage.weightage);
                      experimentTestResultsArrayPerWorkflowRun.push(
                        weightage.weightage
                      );
                      totalExperimentsPassed += 1;
                    }
                    if (chaosData.experimentVerdict === 'Fail') {
                      experimentTestResultsArray.push(0);
                      experimentTestResultsArrayPerWorkflowRun.push(0);
                    }
                    if (
                      chaosData.experimentVerdict === 'Pass' ||
                      chaosData.experimentVerdict === 'Fail'
                    ) {
                      weightsSum += weightage.weightage;
                      isValid = true;
                    }
                  }
                });
              }
            }
          }
          if (executionData.event_type === 'UPDATE' && isValid) {
            const workflowRun = {
              testsPassed: totalExperimentsPassed,
              testsFailed:
                experimentTestResultsArrayPerWorkflowRun.length -
                totalExperimentsPassed,
              resilienceScore: experimentTestResultsArrayPerWorkflowRun.length
                ? (experimentTestResultsArrayPerWorkflowRun.reduce(
                    (a, b) => a + b,
                    0
                  ) /
                    weightsSum) *
                  100
                : 0,
              testDate: data.last_updated,
              workflowRunID: data.workflow_run_id,
              workflowID: workflowId,
            };
            validWorkflowRunsData.push(workflowRun);
          }
        } catch (error) {
          console.error(error);
        }
      });
    } catch (error) {
      setWorkflowRunPresent(false);
      return;
    }
    if (validWorkflowRunsData.length === 1) {
      const resDate = moment(
        new Date(
          parseInt(validWorkflowRunsData[0].testDate, 10) * 1000
        ).toString()
      ).format('YYYY-MM-DD');
      const edgeLow = {
        testsPassed: 0,
        testsFailed: 0,
        resilienceScore: 0,
        testDate: Math.round(
          parseInt(
            moment(resDate).subtract(0.5, 'days').endOf('day').format('x'),
            10
          ) / 1000
        ).toString(),
        workflowRunID: 'edge_low',
        workflowID: workflowId,
      };
      const edgeHigh = {
        testsPassed: 0,
        testsFailed: 0,
        resilienceScore: 0,
        testDate: Math.round(
          parseInt(
            moment(resDate).add(0.5, 'days').startOf('day').format('x'),
            10
          ) / 1000
        ).toString(),
        workflowRunID: 'edge_high',
        workflowID: workflowId,
      };
      workflowRuns.push(edgeLow);
      workflowRuns.push(validWorkflowRunsData[0]);
      workflowRuns.push(edgeHigh);
      setWorkflowRunDataForPlot(workflowRuns);
    } else {
      setWorkflowRunDataForPlot(validWorkflowRunsData);
    }
  }, [data]);

  useEffect(() => {
    const workflowTestsArray: WorkFlowTests[] = [];
    try {
      const selectedWorkflowSchedule = data?.ListWorkflow.filter(
        (w) => w.workflow_id === workflowId
      );
      const workflowRuns = selectedWorkflowSchedule
        ? selectedWorkflowSchedule[0].workflow_runs
        : [];
      const selectedWorkflows = workflowRuns.filter(
        (w) => w.workflow_run_id === selectedWorkflowRunID
      );
      selectedWorkflows?.forEach((data) => {
        try {
          const executionData: ExecutionData = JSON.parse(data.execution_data);
          const { nodes } = executionData;
          let index: number = 1;
          for (const key of Object.keys(nodes)) {
            const node = nodes[key];
            if (node.chaosData) {
              const { chaosData } = node;
              const weightageMap: WeightageMap[] = selectedWorkflowSchedule
                ? selectedWorkflowSchedule[0].weightages
                : [];
              weightageMap.forEach((weightage) => {
                if (weightage.experiment_name === chaosData.experimentName) {
                  workflowTestsArray.push({
                    test_id: index,
                    test_name: chaosData.experimentName,
                    test_result: chaosData.experimentVerdict,
                    test_weight: weightage.weightage,
                    resulting_points:
                      chaosData.experimentVerdict === 'Pass'
                        ? weightage.weightage
                        : 0,
                    last_run: chaosData.lastUpdatedAt,
                  });
                }
              });
            }
            index += 1;
          }
        } catch (error) {
          console.error(error);
        }
      });
      setSelectedWorkflowRunDetails(workflowTestsArray);
    } catch (error) {
      setWorkflowRunPresent(false);
    }
  }, [selectedWorkflowRunID, data]);

  return (
    <Scaffold>
      {workflowRunPresent ? (
        <div>
          {workflowRunDataForPlot.length ? (
            <div className={classes.rootContainer}>
              <div className={classes.root}>
                <div className={classes.button}>
                  <BackButton isDisabled={false} />
                </div>
                <Typography variant="h4">
                  <strong>Workflow Analytics</strong>
                </Typography>
                <div className={classes.headerDiv}>
                  <Typography variant="body1">
                    {t('analytics.viewTestResult')}
                  </Typography>
                </div>
                <div className={classes.analyticsDiv}>
                  <WorkflowRunsBarChart
                    workflowRunData={workflowRunDataForPlot}
                    callBackToShowPopOver={setPopOverDisplay}
                    callBackToSelectWorkflowRun={(
                      selectedWorkflowRunID: string
                    ) => {
                      setSelectedWorkflowRunID(selectedWorkflowRunID);
                    }}
                  />
                  {selectedWorkflowRunID !== '' ? (
                    <WorkflowDetailsTable
                      workflowRunDetails={selectedWorkflowRunDetails ?? []}
                      workflowID={workflowId}
                      reloadAnalytics={() => {
                        setSelectedWorkflowRunID('');
                      }}
                    />
                  ) : (
                    <div />
                  )}
                  {popoverOpen ? (
                    <PopOver
                      testsPassed={selectedWorkflowRunData.testsPassed}
                      testsFailed={selectedWorkflowRunData.testsFailed}
                      resilienceScore={selectedWorkflowRunData.resilienceScore}
                      testDate={selectedWorkflowRunData.testDate}
                      xLoc={selectedWorkflowRunData.xLoc}
                      yLoc={selectedWorkflowRunData.yLoc}
                    />
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          ) : error ? (
            <div>
              <Typography className={classes.waitingText}>
                {t('analytics.fetchError')}
              </Typography>
            </div>
          ) : (
            <div className={classes.waitingScreen}>
              <Typography className={classes.waitingText}>
                {t('analytics.chaosStartWaitingMessage')}
              </Typography>
              <Loader />
            </div>
          )}
        </div>
      ) : (
        <div className={classes.waitingScreen}>
          <Typography className={classes.waitingText}>
            {t('analytics.waitingMessage')}
          </Typography>
          <Loader />
        </div>
      )}
    </Scaffold>
  );
};

export default AnalyticsPage;
