/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import * as _ from 'lodash';
import { Paper, Typography } from '@material-ui/core';
import useStyles from './style';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
  ExecutionData,
} from '../../../models/graphql/workflowData';
import { RootState } from '../../../redux/reducers';
import PassedVsFailed from '../PassedVsFailed';
import TotalWorkflows from '../TotalWorkflows';
import AverageResilienceScore from '../AverageResilienceScore';
import QuickActionCard from '../../../components/QuickActionCard';
import { Message } from '../../../models/header';
import ResilienceScoreComparisonPlot from '../ResilienceScoreComparisonPlot';
import RecentActivity from '../RecentActivity';

interface DataPresentCallBackType {
  (dataPresent: boolean): void;
}

interface Analyticsdata {
  avgWorkflows: number;
  maxWorkflows: number;
  passPercentage: number;
  failPercentage: number;
}

interface ReturningHomeProps {
  callbackToSetDataPresent: DataPresentCallBackType;
  currentStatus: boolean;
}
const ReturningHome: React.FC<ReturningHomeProps> = ({
  callbackToSetDataPresent,
  currentStatus,
}) => {
  const classes = useStyles();
  const userData = useSelector((state: RootState) => state.userData);
  const [workflowDataPresent, setWorkflowDataPresent] = useState<boolean>(
    currentStatus
  );
  const [messageActive, setMessageActive] = useState<boolean>(false);

  // Query to get workflows
  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID: userData.selectedProjectID },
    }
  );

  const [analyticsData, setAnalyticsData] = useState<Analyticsdata>({
    avgWorkflows: 0,
    maxWorkflows: 0,
    passPercentage: 0,
    failPercentage: 0,
  });

  const loadAnalyticsData = (workflowRunData: WorkflowRun[]) => {
    const workflowRunExecutionData: ExecutionData[] = [];
    const experimentTestResultsArray: number[] = [];
    const workflowRunsPerWeek: number[] = [];

    workflowRunData?.forEach((data) => {
      try {
        const executionData: ExecutionData = JSON.parse(data.execution_data);
        workflowRunExecutionData.push(executionData);
        const { nodes } = executionData;
        for (const key of Object.keys(nodes)) {
          const node = nodes[key];
          if (node.chaosData) {
            const { chaosData } = node;
            if (
              chaosData.experimentVerdict === 'Pass' ||
              chaosData.experimentVerdict === 'Fail'
            ) {
              experimentTestResultsArray.push(
                chaosData.experimentVerdict === 'Pass' ? 1 : 0
              );
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    });

    const groupedResults = _.groupBy(workflowRunExecutionData, (data) =>
      moment.unix(parseInt(data['creationTimestamp'], 10)).startOf('isoWeek')
    );

    Object.keys(groupedResults).forEach((week) => {
      workflowRunsPerWeek.push(groupedResults[week].length);
    });

    const testsPassPercentage = experimentTestResultsArray.length
      ? (experimentTestResultsArray.reduce((a, b) => a + b, 0) /
          experimentTestResultsArray.length) *
        100
      : 0;

    setAnalyticsData({
      avgWorkflows:
        workflowRunsPerWeek.reduce((a, b) => a + b, 0) /
        workflowRunsPerWeek.length,
      maxWorkflows: Math.max(...workflowRunsPerWeek),
      passPercentage: testsPassPercentage >= 0 ? testsPassPercentage : 0,
      failPercentage:
        experimentTestResultsArray.length && testsPassPercentage >= 0
          ? 100 - testsPassPercentage
          : 0,
    });
  };

  useEffect(() => {
    if (
      !loading &&
      !error &&
      data &&
      data.getWorkFlowRuns.slice(0).length >= 1
    ) {
      setWorkflowDataPresent(true);
      loadAnalyticsData(data.getWorkFlowRuns);
    } else if (loading === false) {
      setWorkflowDataPresent(false);
    }
  }, [data]);

  useEffect(() => {
    callbackToSetDataPresent(workflowDataPresent);
  }, [workflowDataPresent]);

  const labels = ['K8S1', 'K8S3', 'K8S2', 'K8S4'];

  const xData = {
    Daily: [
      [
        '2020-04-08',
        '2020-04-09',
        '2020-04-10',
        '2020-04-11',
        '2020-04-12',
        '2020-05-13',
        '2020-05-14',
        '2020-05-15',
        '2020-05-16',
        '2020-05-17',
      ],
      [
        '2020-04-08',
        '2020-04-09',
        '2020-04-11',
        '2020-04-12',
        '2020-06-13',
        '2020-06-16',
        '2020-07-17',
      ],
      [
        '2020-03-08',
        '2020-03-09',
        '2020-03-12',
        '2020-04-13',
        '2020-04-14',
        '2020-04-15',
        '2020-04-16',
        '2020-04-17',
      ],
      [
        '2020-04-08',
        '2020-04-09',
        '2020-07-10',
        '2020-07-11',
        '2020-09-12',
        '2020-09-13',
        '2020-11-14',
        '2020-11-16',
        '2020-11-17',
      ],
    ],
    Monthly: [
      ['2020-04-30', '2020-05-31'],
      ['2020-04-30', '2020-06-30', '2020-07-31'],
      ['2020-03-31', '2020-04-30'],
      ['2020-04-30', '2020-07-31', '2020-09-30', '2020-11-30'],
    ],
  };

  const yData = {
    Daily: [
      [0, 73, 72, 74, 70, 70, 66, 66, 69, 100],
      [56, 45, 36, 34, 35, 28, 25],
      [45, 13, 14, 24, 40, 35, 50, 55],
      [23, 18, 21, 13, 18, 17, 16, 23, 76],
    ],
    Monthly: [
      [57.8, 74.2],
      [42.75, 49, 25],
      [24, 45],
      [20.5, 17, 17.5, 38.33],
    ],
  };
  const [activities, setActivities] = useState<Message[]>([]);

  const fetchRandomActivities = useCallback(() => {
    const activitiesList = [];

    const notificationsList = [
      {
        id: '1',
        MessageType: 'New cluster',
        Message: 'connected',
        generatedTime: '',
      },
      {
        id: '2',
        MessageType: 'Argo Chaos workflow',
        Message: 'crashed',
        generatedTime: '',
      },
      {
        id: '3',
        MessageType: 'New workflow',
        Message: 'created',
        generatedTime: '',
      },
      {
        id: '4',
        MessageType: 'Pod Delete workflow',
        Message: 'complete',
        generatedTime: '',
      },
      {
        id: '5',
        MessageType: 'Argo Chaos workflow',
        Message: 'started',
        generatedTime: '',
      },
      {
        id: '6',
        MessageType: 'New project',
        Message: 'Invite Recieved',
        generatedTime: '',
      },
    ];

    const iterations = notificationsList.length;

    const oneDaySeconds = 60 * 60 * 24;

    let curUnix = Math.round(
      new Date().getTime() / 1000 - iterations * oneDaySeconds
    );

    for (let i = 0; i < iterations; i += 1) {
      const notificationItem = notificationsList[i];
      const message = {
        sequenceID: (i as unknown) as string,
        id: notificationItem.id,
        messageType: notificationItem.MessageType,
        date: curUnix,
        text: `${notificationItem.MessageType}- ${notificationItem.Message}`,
      };
      curUnix += oneDaySeconds;
      activitiesList.push(message);
    }
    activitiesList.reverse();
    setActivities(activitiesList);
  }, [setActivities]);

  useEffect(() => {
    fetchRandomActivities();
  }, []);

  return (
    <div>
      {workflowDataPresent ? (
        <div>
          <div className={classes.cardsDiv}>
            <TotalWorkflows
              workflow={data?.getWorkFlowRuns.slice(0).length ?? 0}
              average={analyticsData.avgWorkflows}
              max={analyticsData.maxWorkflows}
            />
            <PassedVsFailed
              passed={parseFloat(analyticsData.passPercentage.toFixed(2))}
              failed={parseFloat(analyticsData.failPercentage.toFixed(2))}
            />
            <AverageResilienceScore value={analyticsData.passPercentage} />
          </div>
          <div className={classes.othersDiv}>
            <div className={classes.resilienceScoresDiv}>
              <Typography className={classes.statsHeading}>
                <strong>Resilience score</strong>
              </Typography>
              <Paper variant="outlined" className={classes.backgroundFix}>
                <ResilienceScoreComparisonPlot
                  xData={xData}
                  yData={yData}
                  labels={labels}
                />
              </Paper>
            </div>
            <div className={classes.extrasDiv}>
              <div>
                <div className={classes.btnHeaderDiv}>
                  <Typography className={classes.statsHeading}>
                    <strong>Recent activity</strong>
                  </Typography>
                  {/*
                  <Button className={classes.seeAllBtn}>
                    <div className={classes.btnSpan}>
                      <Typography className={classes.btnText}>
                        See more
                      </Typography>
                      <img src="icons/next.png" alt="next" />
                    </div>
                  </Button>
                  */}
                </div>
                <Paper
                  variant="outlined"
                  className={classes.fixedRecents}
                  onMouseEnter={() => {
                    setMessageActive(true);
                  }}
                  onMouseLeave={() => {
                    setMessageActive(false);
                  }}
                >
                  {messageActive ? (
                    <Typography variant="h4" className={classes.commingSoon}>
                      {' '}
                      Comming soon!{' '}
                    </Typography>
                  ) : (
                    <RecentActivity activities={activities} />
                  )}
                </Paper>
              </div>
              <div className={classes.quickActionDiv}>
                <QuickActionCard />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ReturningHome;
