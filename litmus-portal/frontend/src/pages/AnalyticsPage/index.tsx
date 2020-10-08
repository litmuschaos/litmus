/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_DETAILS } from '../../graphql';
import {
  ChaosData,
  ExecutionData,
  Workflow,
  WorkflowDataVars,
} from '../../models/graphql/workflowData';
import { RootState } from '../../redux/reducers';
import PopOver from '../../views/ChaosWorkflows/BrowseAnalytics/PopOver';
import WorkflowRunsBarChart from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowRunsBarChart';
import WorkflowDetailsTable from '../../views/ChaosWorkflows/BrowseAnalytics/WorkflowRunDetailsTable';
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
  weight?: number;
  resulting_points?: number;
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

  // Query to get workflows
  const { data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: selectedProjectID } }
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

    const selectedWorkflows = data?.getWorkFlowRuns.filter(
      (w) => w.workflow_id === workflowId
    );
    selectedWorkflows?.forEach((data) => {
      try {
        const executionData: ExecutionData = JSON.parse(data.execution_data);
        const { nodes } = executionData;
        const experimentTestResultsArrayPerWorkflowRun: number[] = [];
        const chaosDataArrayPerWorkflowRun: ChaosData[] = [];
        for (const key of Object.keys(nodes)) {
          const node = nodes[key];
          if (node.chaosData) {
            const { chaosData } = node;
            chaosDataArray.push(chaosData);
            chaosDataArrayPerWorkflowRun.push(chaosData);
            if (
              chaosData.experimentVerdict === 'Pass' ||
              chaosData.experimentVerdict === 'Fail'
            ) {
              experimentTestResultsArray.push(
                chaosData.experimentVerdict === 'Pass' ? 1 : 0
              );
              experimentTestResultsArrayPerWorkflowRun.push(
                chaosData.experimentVerdict === 'Pass' ? 1 : 0
              );
            }
          }
        }

        const workflowRun = {
          testsPassed: experimentTestResultsArrayPerWorkflowRun.length
            ? experimentTestResultsArrayPerWorkflowRun.reduce(
                (a, b) => a + b,
                0
              )
            : 0,
          testsFailed: experimentTestResultsArrayPerWorkflowRun.length
            ? experimentTestResultsArrayPerWorkflowRun.length -
              experimentTestResultsArrayPerWorkflowRun.reduce(
                (a, b) => a + b,
                0
              )
            : 0,
          resilienceScore: experimentTestResultsArrayPerWorkflowRun.length
            ? (experimentTestResultsArrayPerWorkflowRun.reduce(
                (a, b) => a + b,
                0
              ) /
                experimentTestResultsArrayPerWorkflowRun.length) *
              100
            : 0,
          testDate:
            chaosDataArrayPerWorkflowRun[
              chaosDataArrayPerWorkflowRun.length - 1
            ]?.lastUpdatedAt ?? '',
          workflowRunID: data.workflow_run_id,
          workflowID: workflowId,
        };
        if (executionData.event_type === 'UPDATE') {
          validWorkflowRunsData.push(workflowRun);
        }
      } catch (error) {
        console.error(error);
      }
    });

    try {
      const check: string = selectedWorkflows
        ? selectedWorkflows[0].workflow_run_id
        : '';
    } catch (error) {
      setWorkflowRunPresent(false);
      return;
    }
    if (experimentTestResultsArray.length === 1) {
      const workflowRunOnce = {
        testsPassed: experimentTestResultsArray.length
          ? experimentTestResultsArray.reduce((a, b) => a + b, 0)
          : 0,
        testsFailed: experimentTestResultsArray.length
          ? experimentTestResultsArray.length -
            experimentTestResultsArray.reduce((a, b) => a + b, 0)
          : 0,
        resilienceScore: experimentTestResultsArray.length
          ? (experimentTestResultsArray.reduce((a, b) => a + b, 0) /
              experimentTestResultsArray.length) *
            100
          : 0,
        testDate:
          chaosDataArray[chaosDataArray.length - 1]?.lastUpdatedAt ?? '',
        workflowRunID: selectedWorkflows
          ? selectedWorkflows[0].workflow_run_id
          : '',
        workflowID: workflowId,
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
            moment(resDate).subtract(0.5, 'months').endOf('month').format('x'),
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
            moment(resDate).add(0.5, 'months').startOf('month').format('x'),
            10
          ) / 1000
        ).toString(),
        workflowRunID: 'edge_high',
        workflowID: workflowId,
      };

      workflowRuns.push(edgeLow);
      workflowRuns.push(workflowRunOnce);
      workflowRuns.push(edgeHigh);

      setWorkflowRunDataForPlot(workflowRuns);
    } else {
      setWorkflowRunDataForPlot(validWorkflowRunsData);
    }
  }, [data]);

  useEffect(() => {
    const workflowTestsArray: WorkFlowTests[] = [];
    const selectedWorkflows = data?.getWorkFlowRuns.filter(
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
            workflowTestsArray.push({
              test_id: index,
              test_name: chaosData.experimentName,
              test_result: chaosData.experimentVerdict,
              last_run: chaosData.lastUpdatedAt,
            });
          }
          index += 1;
        }
      } catch (error) {
        console.error(error);
      }
    });
    setSelectedWorkflowRunDetails(workflowTestsArray);
  }, [selectedWorkflowRunID, data]);

  return (
    <Scaffold>
      {workflowRunPresent ? (
        <div>
          {workflowRunDataForPlot.length ? (
            <div className={classes.rootContainer}>
              <div className={classes.root}>
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
                      reloadAnalytics={(reload: boolean) => {
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
            <Loader />
          )}
        </div>
      ) : (
        <div>
          <Typography className={classes.waitingText}>
            Waiting for workflow to start running !
          </Typography>
          <div className={classes.loader}>
            <Loader />
          </div>
        </div>
      )}
    </Scaffold>
  );
};

export default AnalyticsPage;
