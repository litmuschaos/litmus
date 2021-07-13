import { useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import { RadialChart, RadialChartMetric } from 'litmus-ui';
import React, { useState } from 'react';
import Loader from '../../../../components/Loader';
import Center from '../../../../containers/layouts/Center';
import { GET_WORKFLOW_RUNS_STATS } from '../../../../graphql';
import {
  WorkflowRunStatsRequest,
  WorkflowRunStatsResponse,
} from '../../../../models/graphql/workflowData';
import { Filter } from '../../../../models/graphql/workflowStats';
import { getProjectID } from '../../../../utils/getSearchParams';
import ScheduleAndRunStats from './ScheduleAndRunStats';
import useStyles from './styles';

const WorkflowGraphs: React.FC = () => {
  const classes = useStyles();

  const theme = useTheme();

  const projectID = getProjectID();

  const { data, loading } = useQuery<
    WorkflowRunStatsResponse,
    WorkflowRunStatsRequest
  >(GET_WORKFLOW_RUNS_STATS, {
    variables: {
      workflowRunStatsRequest: {
        project_id: projectID,
      },
    },
    fetchPolicy: 'cache-and-network',
  });
  // States for filters
  const [filters, setFilters] = useState<Filter>(Filter.Monthly);

  const graphData: RadialChartMetric[] = [
    {
      value: data?.getWorkflowRunStats.succeeded_workflow_runs ?? 0,
      label: 'Completed',
      baseColor: theme.palette.status.workflow.completed,
    },
    {
      value: data?.getWorkflowRunStats.failed_workflow_runs ?? 0,
      label: 'Failed',
      baseColor: theme.palette.status.workflow.failed,
    },
    {
      value: data?.getWorkflowRunStats.running_workflow_runs ?? 0,
      label: 'Running',
      baseColor: theme.palette.status.workflow.running,
    },
  ];
  return (
    <div className={classes.root}>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel className={classes.selectText} />
        <Select
          value={filters}
          onChange={(event) => {
            setFilters(event.target.value as Filter);
          }}
          className={classes.selectText}
        >
          <MenuItem value={Filter.Monthly}>Monthly</MenuItem>
          <MenuItem value={Filter.Daily}>Daily</MenuItem>
          <MenuItem value={Filter.Hourly}>Hourly</MenuItem>
        </Select>
      </FormControl>
      <div className={classes.graphs}>
        <ScheduleAndRunStats filter={filters} />
        <Paper elevation={0} className={classes.radialChartContainer}>
          <Typography className={classes.radialChartContainerHeading}>
            Workflow Run stats
          </Typography>
          <div className={classes.radialChart}>
            {loading ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              <RadialChart
                radialData={graphData}
                legendTableHeight={105}
                heading="Workflows"
                showCenterHeading
              />
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default WorkflowGraphs;
