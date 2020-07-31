import React from 'react';
import useStyles from './styles';

const WorkflowChart: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.rootcontainer}>{/* Chart Group Goes Here */}</div>
  );
};

export default WorkflowChart;
