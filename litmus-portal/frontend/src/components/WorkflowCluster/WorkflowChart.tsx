import React from 'react';
import Chart from '../Charts';
import useStyles from './styles';

const WorkflowChart: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.rootcontainer}>
      <Chart />
    </div>
  );
};

export default WorkflowChart;
