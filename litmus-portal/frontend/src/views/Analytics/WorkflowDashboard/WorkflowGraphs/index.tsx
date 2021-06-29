import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import { RadialChart, RadialChartMetric } from 'litmus-ui';
import React, { useState } from 'react';
import {
  ExecutionData,
  ScheduledWorkflows,
} from '../../../../models/graphql/workflowListData';
import { Filter } from '../../../../models/graphql/workflowStats';
import ScheduleAndRunStats from './ScheduleAndRunStats';
import useStyles from './styles';

interface WorkflowGraphsProps {
  data: ScheduledWorkflows | undefined;
}

const WorkflowGraphs: React.FC<WorkflowGraphsProps> = ({ data }) => {
  const classes = useStyles();

  let completed = 0;
  let running = 0;
  let failed = 0;

  /* eslint-disable no-unused-expressions */
  data?.ListWorkflow.workflows.map((datarow) =>
    datarow.workflow_runs?.map((runs) => {
      if (
        (JSON.parse(runs.execution_data) as ExecutionData).phase === 'Succeeded'
      )
        completed++;
      else if (
        (JSON.parse(runs.execution_data) as ExecutionData).phase === 'Running'
      )
        running++;
      else if (
        (JSON.parse(runs.execution_data) as ExecutionData).phase === 'Failed'
      )
        failed++;
    })
  );

  // States for filters
  const [filters, setFilters] = useState<Filter>(Filter.Monthly);

  const graphData: RadialChartMetric[] = [
    { value: completed, label: 'Completed', baseColor: '#00CC9A' },
    { value: running, label: 'Running', baseColor: '#5252F6' },
    { value: failed, label: 'Failed', baseColor: '#CA2C2C' },
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
        <Paper className={classes.radialChartContainer}>
          <RadialChart
            radialData={graphData}
            legendTableHeight={150}
            heading="Workflows"
            showCenterHeading
          />
        </Paper>
      </div>
    </div>
  );
};

export default WorkflowGraphs;
