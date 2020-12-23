/* eslint-disable no-unused-expressions */
/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { useQuery } from '@apollo/client';
import { Paper, Typography } from '@material-ui/core';
import * as _ from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import QuickActionCard from '../../../components/QuickActionCard';
import { WORKFLOW_LIST_DETAILS } from '../../../graphql';
import { ExecutionData } from '../../../models/graphql/workflowData';
import {
  WeightageMap,
  WorkflowList,
  WorkflowListDataVars,
} from '../../../models/graphql/workflowListData';
import { Message } from '../../../models/header';
import { RootState } from '../../../redux/reducers';
import AverageResilienceScore from '../AverageResilienceScore';
import PassedVsFailed from '../PassedVsFailed';
import RecentActivity from '../RecentActivity';
import ResilienceScoreComparisonPlot from '../ResilienceScoreComparisonPlot';
import TotalWorkflows from '../TotalWorkflows';
import useStyles from './style';

interface DataPresentCallBackType {
  (dataPresent: boolean): void;
}

interface Analyticsdata {
  avgWorkflows: number;
  maxWorkflows: number;
  passPercentage: number;
  failPercentage: number;
  avgResilienceScore: number;
}

interface WorkflowRunData {
  tests_passed: number;
  tests_failed: number;
  resilience_score: number;
}

interface ResilienceScoreComparisonPlotProps {
  xData: { Hourly: string[][]; Daily: string[][]; Monthly: string[][] };
  yData: { Hourly: number[][]; Daily: number[][]; Monthly: number[][] };
  labels: string[];
}

interface DatedResilienceScore {
  date: string;
  value: number;
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
  const { t } = useTranslation();
  const userData = useSelector((state: RootState) => state.userData);
  const [workflowDataPresent, setWorkflowDataPresent] = useState<boolean>(
    currentStatus
  );
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [plotDataForComparison, setPlotDataForComparison] = React.useState<
    ResilienceScoreComparisonPlotProps
  >();
  const [
    totalValidWorkflowRunsCount,
    setTotalValidWorkflowRunsCount,
  ] = React.useState<number>(0);
  const [messageActive, setMessageActive] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<Analyticsdata>({
    avgWorkflows: 0,
    maxWorkflows: 0,
    passPercentage: 0,
    failPercentage: 0,
    avgResilienceScore: 0,
  });

  // Apollo query to get the scheduled workflow data
  const { data, loading, error } = useQuery<WorkflowList, WorkflowListDataVars>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: { projectID: userData.selectedProjectID, workflowIDs: [] },
    }
  );

  const loadWorkflowAnalyticssData = () => {
    const plotData: ResilienceScoreComparisonPlotProps = {
      xData: {
        Hourly: [[]],
        Daily: [[]],
        Monthly: [[]],
      },
      yData: {
        Hourly: [[]],
        Daily: [[]],
        Monthly: [[]],
      },
      labels: [],
    };
    let totalValidRuns: number = 0;
    const timeSeriesArray: DatedResilienceScore[][] = [];
    const timeSeriesArrayForAveragePerWeek: DatedResilienceScore[] = [];
    const totalValidWorkflowRuns: WorkflowRunData = {
      tests_passed: 0,
      tests_failed: 0,
      resilience_score: 0,
    };
    const workflowRunsPerWeek: number[] = [];
    data?.ListWorkflow.forEach((workflowData) => {
      const runs = workflowData ? workflowData.workflow_runs : [];
      const workflowTimeSeriesData: DatedResilienceScore[] = [];
      let isWorkflowValid: boolean = false;
      if (data?.ListWorkflow.length === 1 && runs === null) {
        setWorkflowDataPresent(false);
      }
      try {
        runs.forEach((data) => {
          try {
            const executionData: ExecutionData = JSON.parse(
              data.execution_data
            );
            const { nodes } = executionData;
            const experimentTestResultsArrayPerWorkflowRun: number[] = [];
            let totalExperimentsPassed: number = 0;
            let weightsSum: number = 0;
            let isValid: boolean = false;
            for (const key of Object.keys(nodes)) {
              const node = nodes[key];
              if (node.chaosData) {
                const { chaosData } = node;
                if (
                  chaosData.experimentVerdict === 'Pass' ||
                  chaosData.experimentVerdict === 'Fail'
                ) {
                  const weightageMap: WeightageMap[] = workflowData
                    ? workflowData.weightages
                    : [];
                  weightageMap.forEach((weightage) => {
                    if (
                      weightage.experiment_name === chaosData.experimentName
                    ) {
                      if (chaosData.experimentVerdict === 'Pass') {
                        experimentTestResultsArrayPerWorkflowRun.push(
                          weightage.weightage
                        );
                        totalExperimentsPassed += 1;
                      }
                      if (chaosData.experimentVerdict === 'Fail') {
                        experimentTestResultsArrayPerWorkflowRun.push(0);
                      }
                      if (
                        chaosData.experimentVerdict === 'Pass' ||
                        chaosData.experimentVerdict === 'Fail'
                      ) {
                        weightsSum += weightage.weightage;
                        isValid = true;
                        isWorkflowValid = true;
                      }
                    }
                  });
                }
              }
            }
            if (executionData.event_type === 'UPDATE' && isValid) {
              totalValidRuns += 1;
              totalValidWorkflowRuns.tests_passed += totalExperimentsPassed;
              totalValidWorkflowRuns.tests_failed +=
                experimentTestResultsArrayPerWorkflowRun.length -
                totalExperimentsPassed;
              totalValidWorkflowRuns.resilience_score += experimentTestResultsArrayPerWorkflowRun.length
                ? (experimentTestResultsArrayPerWorkflowRun.reduce(
                    (a, b) => a + b,
                    0
                  ) /
                    weightsSum) *
                  100
                : 0;
              workflowTimeSeriesData.push({
                date: data.last_updated,
                value: experimentTestResultsArrayPerWorkflowRun.length
                  ? (experimentTestResultsArrayPerWorkflowRun.reduce(
                      (a, b) => a + b,
                      0
                    ) /
                      weightsSum) *
                    100
                  : 0,
              });
              timeSeriesArrayForAveragePerWeek.push({
                date: data.last_updated,
                value: experimentTestResultsArrayPerWorkflowRun.length
                  ? (experimentTestResultsArrayPerWorkflowRun.reduce(
                      (a, b) => a + b,
                      0
                    ) /
                      weightsSum) *
                    100
                  : 0,
              });
            }
          } catch (error) {
            console.error(error);
          }
        });
      } catch (error) {
        console.log(error);
      }
      if (isWorkflowValid) {
        plotData.labels.push(workflowData ? workflowData.workflow_name : '');
        timeSeriesArray.push(workflowTimeSeriesData);
      }
    });

    if (totalValidRuns === 0) {
      setWorkflowDataPresent(false);
    }

    timeSeriesArray.reverse().forEach((workflowTimeSeriesData, index) => {
      const hourlyGroupedResults = _.groupBy(workflowTimeSeriesData, (data) =>
        moment
          .unix(parseInt(data.date, 10))
          .startOf('hour')
          .format('YYYY-MM-DD HH:mm:ss')
      );
      const dailyGroupedResults = _.groupBy(workflowTimeSeriesData, (data) =>
        moment.unix(parseInt(data.date, 10)).startOf('day').format('YYYY-MM-DD')
      );
      const monthlyGroupedResults = _.groupBy(workflowTimeSeriesData, (data) =>
        moment.unix(parseInt(data.date, 10)).startOf('month').format('YYYY-MM')
      );
      if (index < 4) {
        plotData.xData.Hourly[index] = [];
        plotData.yData.Hourly[index] = [];
        Object.keys(hourlyGroupedResults).forEach((hour) => {
          let total = 0;
          hourlyGroupedResults[hour].forEach((data) => {
            total += data.value;
          });
          plotData.xData.Hourly[index].push(hour);
          plotData.yData.Hourly[index].push(
            total / hourlyGroupedResults[hour].length
          );
        });
        plotData.xData.Daily[index] = [];
        plotData.yData.Daily[index] = [];
        Object.keys(dailyGroupedResults).forEach((day) => {
          let total = 0;
          dailyGroupedResults[day].forEach((data) => {
            total += data.value;
          });
          plotData.xData.Daily[index].push(day);
          plotData.yData.Daily[index].push(
            total / dailyGroupedResults[day].length
          );
        });
        plotData.xData.Monthly[index] = [];
        plotData.yData.Monthly[index] = [];
        Object.keys(monthlyGroupedResults).forEach((month) => {
          let total = 0;
          monthlyGroupedResults[month].forEach((data) => {
            total += data.value;
          });
          plotData.xData.Monthly[index].push(month);
          plotData.yData.Monthly[index].push(
            total / monthlyGroupedResults[month].length
          );
        });
      }
    });
    setPlotDataForComparison(plotData);
    setTotalValidWorkflowRunsCount(totalValidRuns);
    const testsPassedPercentage: number =
      (totalValidWorkflowRuns.tests_passed /
        (totalValidWorkflowRuns.tests_passed +
          totalValidWorkflowRuns.tests_failed)) *
      100;
    const weeklyGroupedResults = _.groupBy(
      timeSeriesArrayForAveragePerWeek,
      (data) => moment.unix(parseInt(data.date, 10)).startOf('isoWeek')
    );
    Object.keys(weeklyGroupedResults).forEach((week) => {
      workflowRunsPerWeek.push(weeklyGroupedResults[week].length);
    });
    setAnalyticsData({
      avgWorkflows:
        workflowRunsPerWeek.reduce((a, b) => a + b, 0) /
        workflowRunsPerWeek.length,
      maxWorkflows: Math.max(...workflowRunsPerWeek),
      passPercentage:
        totalValidRuns > 0 && testsPassedPercentage >= 0
          ? testsPassedPercentage
          : 0,
      failPercentage:
        totalValidRuns > 0 && testsPassedPercentage >= 0
          ? 100 - testsPassedPercentage
          : 0,
      avgResilienceScore:
        totalValidWorkflowRuns.resilience_score / totalValidRuns,
    });
  };

  useEffect(() => {
    if (!loading && !error && data && data.ListWorkflow.slice(0).length >= 1) {
      setWorkflowDataPresent(true);
      loadWorkflowAnalyticssData();
    } else if (loading === false) {
      setWorkflowDataPresent(false);
    }
    setTimeout(() => {
      setIsChecking(false);
    }, 500);
  }, [data]);

  useEffect(() => {
    callbackToSetDataPresent(workflowDataPresent);
  }, [workflowDataPresent]);

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
      {' '}
      {isChecking ? (
        <div className={classes.loader}>
          <Loader />
        </div>
      ) : (
        <div>
          {workflowDataPresent ? (
            <div>
              <div className={classes.cardsDiv}>
                <TotalWorkflows
                  workflow={totalValidWorkflowRunsCount}
                  average={parseFloat(analyticsData.avgWorkflows.toFixed(0))}
                  max={analyticsData.maxWorkflows}
                />
                <PassedVsFailed
                  passed={parseFloat(analyticsData.passPercentage.toFixed(2))}
                  failed={parseFloat(analyticsData.failPercentage.toFixed(2))}
                />
                <AverageResilienceScore
                  value={parseFloat(
                    analyticsData.avgResilienceScore.toFixed(2)
                  )}
                />
              </div>
              <div className={classes.othersDiv}>
                <div className={classes.resilienceScoresDiv}>
                  <Typography className={classes.statsHeading}>
                    <strong>{t('home.resilienceScore')}</strong>
                  </Typography>
                  <Paper variant="outlined" className={classes.backgroundFix}>
                    {plotDataForComparison ? (
                      <ResilienceScoreComparisonPlot
                        xData={plotDataForComparison.xData}
                        yData={plotDataForComparison.yData}
                        labels={plotDataForComparison.labels}
                      />
                    ) : (
                      <Loader />
                    )}
                  </Paper>
                </div>
                <div className={classes.extrasDiv}>
                  <div>
                    <div className={classes.btnHeaderDiv}>
                      <Typography className={classes.statsHeading}>
                        <strong>{t('home.recentActivity')}</strong>
                      </Typography>
                      {/*
                  <Button className={classes.seeAllBtn}>
                    <div className={classes.btnSpan}>
                      <Typography className={classes.btnText}>
                        {t('home.analytics.moreInfo')}
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
                        <Typography variant="h4" className={classes.comingSoon}>
                          {t('home.comingSoon')}
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
            <div className={classes.loader}>
              <Loader />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReturningHome;
