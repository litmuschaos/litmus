import { useQuery } from '@apollo/client';
import {
  MenuItem,
  Paper,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import {
  getValueColor,
  PassFailBar,
  RadialChart,
  RadialChartMetric,
  RadialProgressChart,
} from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { resilienceScoreColourMap } from '../../../../colors/graphColors';
import Loader from '../../../../components/Loader';
import Center from '../../../../containers/layouts/Center';
import { GET_WORKFLOW_RUNS_STATS } from '../../../../graphql/queries';
import {
  WorkflowRunStatsRequest,
  WorkflowRunStatsResponse,
} from '../../../../models/graphql/workflowData';
import { getProjectID } from '../../../../utils/getSearchParams';
import useStyles from './styles';

interface WorkflowStatsProps {
  workflowID: string;
  isCron: boolean;
  noOfWorkflowRuns: number;
}
const WorkflowStats: React.FC<WorkflowStatsProps> = ({
  workflowID,
  isCron,
  noOfWorkflowRuns,
}) => {
  const classes = useStyles();

  const theme = useTheme();

  const projectID = getProjectID();

  const [showWorkflowStats, setShowWorkflowStats] = useState<boolean>(true);

  const [isSingleRun, setIsSingleRun] = useState<boolean>(false);

  const { data, loading } = useQuery<
    WorkflowRunStatsResponse,
    WorkflowRunStatsRequest
  >(GET_WORKFLOW_RUNS_STATS, {
    variables: {
      workflowRunStatsRequest: {
        project_id: projectID,
        workflow_ids: [workflowID],
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!isCron && noOfWorkflowRuns === 1) {
      setShowWorkflowStats(false);
      setIsSingleRun(true);
    }
  }, []);

  const graphData: RadialChartMetric[] = [
    {
      value: isSingleRun
        ? data?.getWorkflowRunStats.experiments_passed ?? 0
        : data?.getWorkflowRunStats.succeeded_workflow_runs ?? 0,
      label: isSingleRun ? 'Passed' : 'Completed',
      baseColor: theme.palette.status.experiment.completed,
    },
    {
      value: isSingleRun
        ? data?.getWorkflowRunStats.experiments_failed ?? 0
        : data?.getWorkflowRunStats.failed_workflow_runs ?? 0,
      label: 'Failed',
      baseColor: theme.palette.status.experiment.failed,
    },
    {
      value: isSingleRun
        ? data?.getWorkflowRunStats.experiments_awaited ?? 0
        : data?.getWorkflowRunStats.running_workflow_runs ?? 0,
      label: isSingleRun ? 'Awaited' : 'Running',
      baseColor: theme.palette.status.workflow.running,
    },
  ];

  if (isSingleRun) {
    graphData.push(
      {
        value: data?.getWorkflowRunStats.experiments_stopped ?? 0,
        label: 'Stopped',
        baseColor: theme.palette.status.experiment.error,
      },
      {
        value: data?.getWorkflowRunStats.experiments_na ?? 0,
        label: 'NA',
        baseColor: theme.palette.status.experiment.omitted,
      }
    );
  }

  const handleStatsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setShowWorkflowStats((event.target.value as number) !== 1);
  };

  const progressGraphData = {
    value: data?.getWorkflowRunStats.average_resiliency_score ?? 0,
    label: 'Avg Resiliency Score',
    baseColor: getValueColor(
      data?.getWorkflowRunStats.average_resiliency_score ?? 0,
      resilienceScoreColourMap
    ),
  };

  return (
    <div className={classes.root}>
      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <div className={classes.topDiv}>
          <Paper className={classes.containerBlock}>
            <Typography className={classes.cardText}>
              {isSingleRun ? 'Experiment Statistics' : 'Workflow Statistics'}
            </Typography>
            <div className={classes.radialChart}>
              <RadialChart
                legendTableHeight={isSingleRun ? 160 : NaN}
                radialData={graphData}
                heading={isSingleRun ? 'Experiments' : 'Workflows'}
                showCenterHeading
                alignLegendTable="right"
              />
            </div>
          </Paper>
          <Paper className={classes.containerBlock}>
            <Typography className={classes.cardText}>
              {isSingleRun ? 'Resilience Score' : 'Average Resilience Score'}
            </Typography>
            <div className={classes.radialProgressChart}>
              <RadialProgressChart
                radialData={progressGraphData}
                semiCircle
                unit="%"
                imageSrc="./icons/resilienceGraph.svg"
                imageAlt="Resiliency Graph"
                iconSize="2rem"
                iconTop="3.5rem"
              />
            </div>
            <Typography className={classes.cardBottomText}>
              {isSingleRun
                ? 'Based on experiment results'
                : 'Based on workflow results'}
            </Typography>
          </Paper>
          <Paper className={classes.containerBlock}>
            <div className={classes.cardHeader}>
              <Typography className={classes.cardText}>
                {showWorkflowStats
                  ? 'Succeeded vs Failed '
                  : 'Passed vs Failed '}
              </Typography>
              {!isSingleRun && (
                <Select
                  id="demo-simple-select"
                  value={showWorkflowStats ? 0 : 1}
                  onChange={handleStatsChange}
                  className={classes.dropDown}
                >
                  <MenuItem value={0}>Workflow Runs</MenuItem>
                  <MenuItem value={1}>Experiments</MenuItem>
                </Select>
              )}
            </div>
            <div className={classes.passedFailedBar}>
              <PassFailBar
                passPercentage={
                  showWorkflowStats
                    ? data?.getWorkflowRunStats
                        .workflow_run_succeeded_percentage ?? 0
                    : data?.getWorkflowRunStats.passed_percentage ?? 0
                }
                failPercentage={
                  showWorkflowStats
                    ? data?.getWorkflowRunStats
                        .workflow_run_failed_percentage ?? 0
                    : data?.getWorkflowRunStats.failed_percentage ?? 0
                }
              />
            </div>
            <Typography className={classes.cardBottomText1}>
              {showWorkflowStats
                ? 'Statistics taken from all workflow results'
                : 'Statistics taken from all experiments results'}
            </Typography>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default WorkflowStats;
