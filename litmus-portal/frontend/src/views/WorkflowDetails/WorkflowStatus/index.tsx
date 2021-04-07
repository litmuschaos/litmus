import { Typography } from '@material-ui/core';
import React from 'react';
import { RUNNING, SUCCEEDED, PENDING, FAILED } from '../workflowConstants';
import useStyles from './styles';

interface WorkflowStatusProps {
  phase: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ phase }) => {
  const classes = useStyles();

  function getStatus(phase: string) {
    switch (phase) {
      case SUCCEEDED:
        return classes.succeeded;
      case RUNNING:
        return classes.running;
      case FAILED:
        return classes.failed;
      case PENDING:
        return classes.pending;
      default:
        return classes.pending;
    }
  }

  return (
    <div className={classes.status}>
      <span className={classes.icon}>
        <img
          className={phase === RUNNING ? classes.runningSmallIcon : ''}
          src={`/icons/${phase.toLowerCase()}.svg`}
          alt="status"
        />
      </span>
      <Typography>
        <span className={getStatus(phase)}>
          <strong>{phase === SUCCEEDED ? 'Completed' : phase}</strong>
        </span>
      </Typography>
    </div>
  );
};

export default WorkflowStatus;
