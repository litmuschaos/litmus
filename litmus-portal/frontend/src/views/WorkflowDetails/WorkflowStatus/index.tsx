import { Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface WorkflowStatusProps {
  phase: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ phase }) => {
  const classes = useStyles();

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
        <span
          className={`${
            phase === 'Succeeded'
              ? classes.succeeded
              : phase === 'failed'
              ? classes.failed
              : phase === 'Running'
              ? classes.running
              : classes.pending
          }`}
        >
          <strong>{phase}</strong>
        </span>
      </Typography>
    </div>
  );
};

export default WorkflowStatus;
