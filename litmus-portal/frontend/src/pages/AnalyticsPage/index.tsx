/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ChaosData,
  Nodes,
} from '../../models/graphql/workflowData';
import { RootState } from '../../redux/reducers';
import WorkflowRunsBarChart from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowRunsBarChart';
import PopOver from '../../views/ChaosWorkflows/BrowseAnalytics/PopOver';
import useStyles from './styles';

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
    const experimentTestResultsArray: number[] = [];
    const chaosDataArray: ChaosData[] = [];

    const selectedWorkflows = data?.getWorkFlowRuns.filter(
      (w) => w.workflow_run_id === workflowRunId
    );

    selectedWorkflows?.forEach((data) => {
      try {
        const executionData: ExecutionData = JSON.parse(data.execution_data);
        const { nodes } = executionData;
        for (const key of Object.keys(nodes)) {
          const node = nodes[key];
          if (node.chaosData) {
            const { chaosData } = node;
            chaosDataArray.push(chaosData);
            experimentTestResultsArray.push(
              chaosData.experimentVerdict === 'Pass' ? 1 : 0
            );
          }
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
      testDate: chaosDataArray[0]?.lastUpdatedAt ?? '',
      workflowRunID: workflowRunId,
    };

    const resDate = moment(
      new Date(
        parseInt(chaosDataArray[0]?.lastUpdatedAt ?? '', 10) * 1000
      ).toString()
    ).format('YYYY-MM-DD');

    const edgeLow = {
      testsPassed: 0,
      testsFailed: 0,
      resilienceScore: 0,
      testDate: Math.round(
        parseInt(
          moment(resDate).subtract(1, 'months').endOf('month').format('x'),
          10
        ) / 1000
      ).toString(),
      workflowRunID: 'edge_low',
    };

    const edgeHigh = {
      testsPassed: 0,
      testsFailed: 0,
      resilienceScore: 0,
      testDate: Math.round(
        parseInt(
          moment(resDate).add(1, 'months').endOf('month').format('x'),
          10
        ) / 1000
      ).toString(),
      workflowRunID: 'edge_high',
    };

    workflowRuns.push(edgeLow);
    workflowRuns.push(workflowRunOnce);
    workflowRuns.push(edgeHigh);

    setWorkflowRunDataForPlot(workflowRuns);
  }, [data]);

  return (
    <Scaffold>
      {workflowRunDataForPlot.length ? (
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
