import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import { RadialChart } from 'litmus-ui';
// import { RadialChart } from 'litmus-ui';
import React, { useState } from 'react';
import { Filter } from '../../../../models/graphql/scheduleData';
import {
  ExecutionData,
  // ExecutionData,
  WorkflowList,
} from '../../../../models/graphql/workflowListData';
import ScheduleAndRunStats from './ScheduleAndRunStats';
import useStyles from './styles';

interface WorkflowGraphsProps {
  data: WorkflowList | undefined;
}

interface RadialChartMetric {
  value: number;
  label?: string;
  baseColor?: string;
}

const WorkflowGraphs: React.FC<WorkflowGraphsProps> = ({ data }) => {
  const classes = useStyles();

  let completed = 0;
  let running = 0;
  let failed = 0;

  data?.ListWorkflow.map((datarow) => {
    datarow.workflow_runs?.map((runs) => {
      console.log((JSON.parse(runs.execution_data) as ExecutionData).phase);
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
    });
  });

  // States for filters
  const [filters, setFilters] = useState<Filter>(Filter.monthly);

  const graphData: RadialChartMetric[] = [
    { value: completed, label: 'Completed', baseColor: '#00CC9A' },
    { value: running, label: 'Running', baseColor: '#5252F6' },
    { value: failed, label: 'Failed', baseColor: '#CA2C2C' },
  ];
  return (
    <div>
      <Paper className={classes.paper}>
        <FormControl variant="outlined" className={classes.formControl} focused>
          <InputLabel className={classes.selectText}></InputLabel>
          <Select
            value={filters}
            onChange={(event) => {
              setFilters(event.target.value as Filter);
            }}
            className={classes.selectText}
          >
            <MenuItem value={Filter.monthly}>Monthly</MenuItem>
            <MenuItem value={Filter.weekly}>Weekly</MenuItem>
            <MenuItem value={Filter.hourly}>Hourly</MenuItem>
          </Select>
        </FormControl>
        <div className={classes.root}>
          <ScheduleAndRunStats filter={filters} />
          <Paper className={classes.radialChartContainer}>
            <RadialChart
              radialData={graphData}
              heading="Workflows"
              showCenterHeading
            />
          </Paper>
        </div>
      </Paper>
    </div>
  );
};

export default WorkflowGraphs;
