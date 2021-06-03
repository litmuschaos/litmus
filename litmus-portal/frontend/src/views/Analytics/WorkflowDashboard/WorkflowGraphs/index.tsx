import { Paper } from '@material-ui/core';
import { RadialChart } from 'litmus-ui';
import React from 'react';
import {
  ExecutionData,
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

  let completed = 0,
    running = 0,
    failed = 0;

  data?.ListWorkflow.map((datarow) => {
    datarow.workflow_runs.map((runs) => {
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

  const graphData: RadialChartMetric[] = [
    { value: completed, label: 'Completed', baseColor: '#00CC9A' },
    { value: running, label: 'Running', baseColor: '#5252F6' },
    { value: failed, label: 'Failed', baseColor: '#CA2C2C' },
  ];
  return (
    <div>
      <Paper className={classes.root}>
        <ScheduleAndRunStats />
      </Paper>
      <Paper className={classes.radialChartContainer}>
        <RadialChart
          radialData={graphData}
          heading="Workflows"
          showCenterHeading
        />
      </Paper>
    </div>
  );
};

export default WorkflowGraphs;
