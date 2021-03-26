import { useQuery } from '@apollo/client';
import { Grid } from '@material-ui/core';
import * as _ from 'lodash';
import moment from 'moment';
import * as React from 'react';
import { useEffect, useState } from 'react';
import Loader from '../../../components/Loader';
import { WORKFLOW_LIST_DETAILS } from '../../../graphql';
import {
  ExecutionData,
  WeightageMap,
  Workflow,
  WorkflowList,
  WorkflowListDataVars,
} from '../../../models/graphql/workflowListData';
import { getProjectID } from '../../../utils/getSearchParams';
import { sortNumDesc } from '../../../utils/sort';
import AgentCard from './AgentCard';
import PassFailCard from './PassFailCard';
import ProjectCard from './ProjectsCard';
import QuickActionCard from './QuickActionCard';
import ResilienceScoreCard from './ResilienceScoreCard';
import useStyles from './styles';
import TotalWorkflows from './TotalWorkflows';

interface Analyticsdata {
  avgWorkflows: number;
  maxWorkflows: number;
  passPercentage: number;
  failPercentage: number;
  avgResilienceScore: number;
}

interface DatedResilienceScore {
  date: string;
  value: number;
}

interface WorkflowRunData {
  tests_passed: number;
  tests_failed: number;
  resilience_score: number;
}

interface ReturningHomeProps {
  callbackToSetDataPresent: (dataPresent: boolean) => void;
  currentStatus: boolean;
}

const ReturningHome: React.FC<ReturningHomeProps> = ({
  callbackToSetDataPresent,
  currentStatus,
}) => {
  const classes = useStyles();
  const [workflowDataPresent, setWorkflowDataPresent] = useState<boolean>(
    currentStatus
  );
  const [
    totalValidWorkflowRunsCount,
    setTotalValidWorkflowRunsCount,
  ] = React.useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<Analyticsdata>({
    avgWorkflows: 0,
    maxWorkflows: 0,
    passPercentage: 0,
    failPercentage: 0,
    avgResilienceScore: 0,
  });
  const projectID = getProjectID();

  // Apollo query to get the scheduled workflow data
  const { data, loading, error } = useQuery<WorkflowList, WorkflowListDataVars>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: { projectID, workflowIDs: [] },
    }
  );

  const loadWorkflowAnalyticssData = () => {
    let totalValidRuns: number = 0;
    const timeSeriesArrayForAveragePerWeek: DatedResilienceScore[] = [];
    const totalValidWorkflowRuns: WorkflowRunData = {
      tests_passed: 0,
      tests_failed: 0,
      resilience_score: 0,
    };
    const workflowRunsPerWeek: number[] = [];
    if (data && data.ListWorkflow && data.ListWorkflow.length) {
      const sortedWorkflowsData = data.ListWorkflow.slice().sort(
        (a: Workflow, b: Workflow) => {
          const x = parseInt(a.created_at, 10);
          const y = parseInt(b.created_at, 10);
          sortNumDesc(y, x);
          return 0;
        }
      );
      if (sortedWorkflowsData && sortedWorkflowsData.length) {
        sortedWorkflowsData.forEach((workflowData: Workflow) => {
          const runs = workflowData ? workflowData.workflow_runs : [];
          const workflowTimeSeriesData: DatedResilienceScore[] = [];
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
                const workflowsRunResults: number[] = [];
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
                      // eslint-disable-next-line
                      weightageMap.forEach((weightage) => {
                        if (
                          weightage.experiment_name === chaosData.experimentName
                        ) {
                          if (chaosData.experimentVerdict === 'Pass') {
                            workflowsRunResults.push(
                              (weightage.weightage *
                                parseInt(
                                  chaosData.probeSuccessPercentage,
                                  10
                                )) /
                                100
                            );
                            totalExperimentsPassed += 1;
                          }
                          if (chaosData.experimentVerdict === 'Fail') {
                            workflowsRunResults.push(0);
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
                  totalValidRuns += 1;

                  totalValidWorkflowRuns.tests_passed += totalExperimentsPassed;
                  totalValidWorkflowRuns.tests_failed +=
                    workflowsRunResults.length - totalExperimentsPassed;
                  totalValidWorkflowRuns.resilience_score += workflowsRunResults.length
                    ? (workflowsRunResults.reduce((a, b) => a + b, 0) /
                        weightsSum) *
                      100
                    : 0;
                  workflowTimeSeriesData.push({
                    date: data.last_updated,
                    value: workflowsRunResults.length
                      ? (workflowsRunResults.reduce((a, b) => a + b, 0) /
                          weightsSum) *
                        100
                      : 0,
                  });
                  timeSeriesArrayForAveragePerWeek.push({
                    date: data.last_updated,
                    value: workflowsRunResults.length
                      ? (workflowsRunResults.reduce((a, b) => a + b, 0) /
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
            console.error(error);
          }
        });
      }
    }

    // checks for presence of valid workflow data
    if (totalValidRuns === 0) {
      setWorkflowDataPresent(false);
    }

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
        totalValidRuns > 0
          ? totalValidWorkflowRuns.resilience_score / totalValidRuns
          : 0,
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

  return (
    <div>
      {/* Row 1 */}
      {isChecking ? (
        <div className={classes.loader}>
          <Loader />
        </div>
      ) : (
        <div className={classes.firstRow}>
          <Grid container spacing={3}>
            <Grid container item xs={12} spacing={2}>
              <Grid item xs={4}>
                <TotalWorkflows
                  workflow={totalValidWorkflowRunsCount}
                  average={parseFloat(analyticsData.avgWorkflows.toFixed(0))}
                  max={analyticsData.maxWorkflows}
                />
              </Grid>
              <Grid item xs={4}>
                <ResilienceScoreCard
                  value={parseFloat(
                    analyticsData.avgResilienceScore.toFixed(2)
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <ProjectCard />
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={3}>
              <Grid item xs={4}>
                <AgentCard />
              </Grid>
              <Grid item xs={4}>
                <PassFailCard
                  passed={parseFloat(analyticsData.passPercentage.toFixed(2))}
                />
              </Grid>
              <Grid item xs={4}>
                <QuickActionCard />
              </Grid>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default ReturningHome;
