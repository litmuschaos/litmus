import { useQuery } from '@apollo/client';
import { MenuItem, Paper, Select, Typography } from '@material-ui/core';
import {
  getValueColor,
  PassFailBar,
  RadialChart,
  RadialChartMetric,
  RadialProgressChart,
} from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import Loader from '../../../../components/Loader';
import Center from '../../../../containers/layouts/Center';
import { GET_WORKFLOW_RUNS_STATS } from '../../../../graphql/queries';
import {
  WorkflowRunStatsRequest,
  WorkflowRunStatsResponse,
} from '../../../../models/graphql/workflowData';
import { resilienceScoreColourMap } from '../../../../models/graphql/workflowStats';
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

  const projectID = getProjectID();

  const [showWorkflowStats, setShowWorkflowStats] = useState<boolean>(true);

  const [isSingleRun, setIsSingleRun] = useState<boolean>(false);
  // let graphData: RadialChartMetric[] = [];
  const [graphData, setGraphData] = useState<RadialChartMetric[]>([]);
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
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setGraphData([
        {
          value: showWorkflowStats
            ? data?.getWorkflowRunStats.succeeded_workflow_runs ?? 0
            : data?.getWorkflowRunStats.experiments_passed ?? 0,
          label: 'Completed',
          baseColor: '#00CC9A',
        },
        {
          value: showWorkflowStats
            ? data?.getWorkflowRunStats.running_workflow_runs ?? 0
            : data?.getWorkflowRunStats.experiments_awaited ?? 0,
          label: 'Running',
          baseColor: '#5252F6',
        },
        {
          value: showWorkflowStats
            ? data?.getWorkflowRunStats.failed_workflow_runs ?? 0
            : data?.getWorkflowRunStats.experiments_failed ?? 0,
          label: 'Failed',
          baseColor: '#CA2C2C',
        },
      ]);
    },
  });

  const handleStatsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setShowWorkflowStats((event.target.value as number) !== 1);
  };

  useEffect(() => {
    if (!isCron && noOfWorkflowRuns === 1) {
      setShowWorkflowStats(false);
      setIsSingleRun(true);
    }
  }, []);
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
                imageSrc="/icons/resilienceGraph.svg"
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
