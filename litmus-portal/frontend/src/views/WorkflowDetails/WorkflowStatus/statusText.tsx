import { Typography } from '@material-ui/core';
import React from 'react';
import {
  ERROR,
  FAILED,
  OMITTED,
  PENDING,
  RUNNING,
  SKIPPED,
  SUCCEEDED,
} from '../workflowConstants';
import useStyles from './styles';

interface WorkflowStatusProps {
  phase: string;
}

const WorkflowStatusText: React.FC<WorkflowStatusProps> = ({ phase }) => {
  const classes = useStyles();
  function getStatus(phase: string) {
    switch (phase) {
      case SUCCEEDED:
        return `${classes.succeeded}`;
      case RUNNING:
        return `${classes.running}`;
      case FAILED:
        return `${classes.failed}`;
      case PENDING:
        return `${classes.pending}`;
      case OMITTED:
        return `${classes.omitted}`;
      case SKIPPED:
        return `${classes.skipped}`;
      case ERROR:
        return `${classes.error}`;
      default:
        return `${classes.pending}`;
    }
  }
  return (
    <div>
      <Typography
        className={`${classes.statusText} ${getStatus(phase)}`}
        data-cy="workflowStatus"
      >
        {phase}
      </Typography>
    </div>
  );
};

export default WorkflowStatusText;
