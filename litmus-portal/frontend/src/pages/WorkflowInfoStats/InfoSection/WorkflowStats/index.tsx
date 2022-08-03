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
        projectID,
        workflowIDs: [workflowID],
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
        ? data?.getWorkflowRunStats.experimentsPassed ?? 0
        : data?.getWorkflowRunStats.succeededWorkflowRuns ?? 0,
      label: isSingleRun ? 'Passed' : 'Succeeded',
      baseColor: theme.palette.status.experiment.completed,
    },
    {
      value: isSingleRun
        ? data?.getWorkflowRunStats.experimentsFailed ?? 0
        : data?.getWorkflowRunStats.failedWorkflowRuns ?? 0,
      label: 'Failed',
      baseColor: theme.palette.status.experiment.failed,
    },
    {
      value: isSingleRun
        ? data?.getWorkflowRunStats.experimentsAwaited ?? 0
        : data?.getWorkflowRunStats.runningWorkflowRuns ?? 0,
      label: isSingleRun ? 'Awaited' : 'Running',
      baseColor: theme.palette.status.workflow.running,
    },
  ];

  if (isSingleRun) {
    graphData.push(
      {
        value: data?.getWorkflowRunStats.experimentsStopped ?? 0,
        label: 'Stopped',
        baseColor: theme.palette.status.experiment.error,
      },
      {
        value: data?.getWorkflowRunStats.experimentsNa ?? 0,
        label: 'NA',
        baseColor: theme.palette.status.experiment.omitted,
      }
    );
  }

  const handleStatsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setShowWorkflowStats((event.target.value as number) !== 1);
  };

  const progressGraphData = {
    value: data?.getWorkflowRunStats.averageResiliencyScore ?? 0,
    label: 'Avg Resiliency Score',
    baseColor: getValueColor(
      data?.getWorkflowRunStats.averageResiliencyScore ?? 0,
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
              {isSingleRun
                ? 'Experiment Statistics'
                : 'Chaos Scenario Statistics'}
            </Typography>
            <div className={classes.radialChart} data-cy="statsRadialChart">
              <RadialChart
                legendTableHeight={isSingleRun ? 160 : NaN}
                radialData={graphData}
                heading={
                  isSingleRun
                    ? 'Experiments'
                    : data?.getWorkflowRunStats.totalWorkflowRuns !== 1
                    ? 'Runs'
                    : 'Run'
                }
                showCenterHeading
                alignLegendTable="right"
              />
            </div>
          </Paper>
          <Paper className={classes.containerBlock}>
            <Typography className={classes.cardText}>
              {isSingleRun ? 'Resilience Score' : 'Average Resilience Score'}
            </Typography>
            <div
              className={classes.radialProgressChart}
              data-cy="statsResScoreChart"
            >
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
                : 'Based on Chaos Scenario results'}
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
                  data-cy="statsDropdown"
                >
                  <MenuItem value={0}>Chaos Scenario Runs</MenuItem>
                  <MenuItem value={1}>Chaos Experiments</MenuItem>
                </Select>
              )}
            </div>
            <div className={classes.passedFailedBar} data-cy="statsPassFailBar">
              <PassFailBar
                passPercentage={
                  showWorkflowStats
                    ? data?.getWorkflowRunStats
                        .workflowRunSucceededPercentage ?? 0
                    : data?.getWorkflowRunStats.passedPercentage ?? 0
                }
                failPercentage={
                  showWorkflowStats
                    ? data?.getWorkflowRunStats.workflowRunFailedPercentage ?? 0
                    : data?.getWorkflowRunStats.failedPercentage ?? 0
                }
              />
            </div>
            <Typography className={classes.cardBottomText1}>
              {showWorkflowStats
                ? 'Statistics taken from all Chaos Scenario results'
                : 'Statistics taken from all Chaos Experiments results'}
            </Typography>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default WorkflowStats;
