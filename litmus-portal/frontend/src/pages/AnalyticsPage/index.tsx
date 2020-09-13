/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_DETAILS } from '../../graphql';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
} from '../../models/graphql/workflowData';
import { RootState } from '../../redux/reducers';
import WorkflowRunsBarChart from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowRunsBarChart';
import PopOver from '../../views/ChaosWorkflows/BrowseAnalytics/PopOver';
import useStyles from './styles';

interface ChaosData {
  engineName: string;
  engineUID: string;
  experimentName: string;
  experimentPod: string;
  experimentStatus: string;
  experimentVerdict: string;
  failStep: string;
  lastUpdatedAt: string;
  namespace: string;
  probeSuccessPercentage: string;
  runnerPod: string;
}

interface WorkflowRunData {
  testsPassed: number;
  testsFailed: number;
  resilienceScore: number;
  testDate: string;
  workflowRunID: string;
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

const AnalyticsPage: React.FC = () => {
  const classes = useStyles();

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

  const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false);

  const setPopOverDisplay = (
    selectedWorkflowRunDetails: SelectedWorkflowRunData,
    visible: boolean
  ) => {
    setSelectedWorkflowRunData(selectedWorkflowRunDetails);
    setPopoverOpen(visible);
  };

  const { pathname } = useLocation();
  // Getting the workflow nome from the pathname
  const workflowRunId = pathname.split('/')[3];

  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Query to get workflows
  const { data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: selectedProjectID } }
  );

  const [workflowRunDataForPlot, setWorkflowRunDataForPlot] = React.useState<
    WorkflowRunData[]
  >([]);

  useEffect(() => {
    const workflowRuns: WorkflowRunData[] = [];

    let testDate: string = '';

    const selectedWorkflows = data?.getWorkFlowRuns.filter(
      (w) => w.workflow_run_id === workflowRunId
    );

    const workflowRunsExecutionData: ExecutionData[] = [];
    selectedWorkflows?.forEach((data) => {
      try {
        const executionData: ExecutionData = JSON.parse(data.execution_data);
        workflowRunsExecutionData.push(executionData);
      } catch (error) {
        console.error(error);
      }
    });

    const chaosDataArray: ChaosData[] = [];
    const experimentTestNameArray: string[] = [];
    const experimentTestVerdictArray: string[] = [];
    const experimentTestResultsArray: number[] = [];

    workflowRunsExecutionData.forEach((data) => {
      try {
        const nodeKeys = Object.keys(data.nodes);
        const { nodes } = data;
        const chaosNodeKeys: string[] = [];
        nodeKeys.forEach((node) => {
          try {
            const { name } = data.nodes[node];
            if (name === 'run-chaos') {
              chaosNodeKeys.push(node);
            }
          } catch (error) {
            console.error(error);
          }
        });

        chaosNodeKeys.forEach((key) => {
          try {
            const chaosNode = nodes[key];
            const chaosNodeData = JSON.parse(JSON.stringify(chaosNode));
            chaosDataArray.push(chaosNodeData['chaosData']);
          } catch (error) {
            console.error(error);
          }
        });
      } catch (error) {
        console.error(error);
      }
    });

    chaosDataArray.forEach((data) => {
      try {
        experimentTestNameArray.push(data['experimentName']);
        experimentTestVerdictArray.push(data['experimentVerdict']);
        testDate = data['lastUpdatedAt'];
        if (data['experimentVerdict'] === 'Pass') {
          experimentTestResultsArray.push(1);
        } else if (data['experimentVerdict'] === 'Fail') {
          experimentTestResultsArray.push(0);
        }
      } catch (error) {
        console.error(error);
      }
    });

    const workflowRunOnce = {
      testsPassed: experimentTestResultsArray.reduce((a, b) => a + b, 0),
      testsFailed:
        experimentTestResultsArray.length -
        experimentTestResultsArray.reduce((a, b) => a + b, 0),
      resilienceScore:
        (experimentTestResultsArray.reduce((a, b) => a + b, 0) /
          experimentTestResultsArray.length) *
        100,
      testDate,
      workflowRunID: workflowRunId,
    };

    const updated = new Date(parseInt(testDate, 10) * 1000).toString();
    const resDate = moment(updated).format('YYYY-MM-DD');

    const lowEdge = Math.round(
      parseInt(
        moment(resDate).subtract(1, 'months').endOf('month').format('x'),
        10
      ) / 1000
    ).toString();

    const highEdge = Math.round(
      parseInt(
        moment(resDate).add(1, 'months').endOf('month').format('x'),
        10
      ) / 1000
    ).toString();

    const dummyLow = {
      testsPassed: 0,
      testsFailed: 0,
      resilienceScore: 0,
      testDate: lowEdge,
      workflowRunID: 'dummy_low',
    };

    const dummyHigh = {
      testsPassed: 0,
      testsFailed: 0,
      resilienceScore: 0,
      testDate: highEdge,
      workflowRunID: 'dummy_high',
    };

    workflowRuns.push(dummyLow);
    workflowRuns.push(workflowRunOnce);
    workflowRuns.push(dummyHigh);

    setWorkflowRunDataForPlot(workflowRuns);
  }, [data]);

  return (
    <Scaffold>
      {workflowRunDataForPlot.length > 0 ? (
        <div className={classes.rootContainer}>
          <div className={classes.root}>
            <Typography variant="h3">
              <strong>Workflow Analytics</strong>
            </Typography>
            <div className={classes.headerDiv}>
              <Typography variant="h6">
                Click on test to view the results for the selected period
              </Typography>
            </div>

            <div className={classes.analyticsDiv}>
              <WorkflowRunsBarChart
                workflowRunData={workflowRunDataForPlot}
                callBackToShowPopOver={setPopOverDisplay}
              />
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
        <Typography>An error has occurred while fetching the data</Typography>
      ) : (
        <Loader />
      )}
    </Scaffold>
  );
};

export default AnalyticsPage;
