import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RUNNING, SUCCEEDED, PENDING, FAILED } from '../workflowConstants';
import useStyles from './styles';

interface WorkflowStatusProps {
  phase: string;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ phase }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  function getStatus(phase: string) {
    switch (phase) {
      case SUCCEEDED:
        return `${classes.textBold} ${classes.succeeded}`;
      case RUNNING:
        return `${classes.textBold} ${classes.running}`;
      case FAILED:
        return `${classes.textBold} ${classes.failed}`;
      case PENDING:
        return `${classes.textBold} ${classes.pending}`;
      default:
        return `${classes.textBold} ${classes.pending}`;
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
          {phase === SUCCEEDED
            ? `${t('workflowDetailsView.workflowInfo.Completed')}`
            : phase}
        </span>
      </Typography>
    </div>
  );
};

export default WorkflowStatus;
