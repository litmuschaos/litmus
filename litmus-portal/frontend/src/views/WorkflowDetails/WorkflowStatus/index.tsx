import { Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface WorkflowStatusProps {
  phase: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ phase }) => {
  const classes = useStyles();

  function getStatus(phase: string) {
    switch (phase) {
      case 'Succeeded':
        return classes.succeeded;
      case 'Running':
        return classes.running;
      case 'Failed':
        return classes.failed;
      case 'Pending':
        return classes.pending;
      default:
        return classes.pending;
    }
  }

  return (
    <div className={classes.status}>
      <span className={classes.icon}>
        <img
          className={
            phase.toLowerCase() === 'running' ? classes.runningSmallIcon : ''
          }
          src={`/icons/${phase.toLowerCase()}.svg`}
          alt="status"
        />
      </span>
      <Typography>
        <span className={getStatus(phase)}>
          <strong>{phase}</strong>
        </span>
      </Typography>
    </div>
  );
};

export default WorkflowStatus;
