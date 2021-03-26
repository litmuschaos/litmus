import { Paper, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
interface WorkflowCardProps {
  workflow: number;
  average: number;
  max: number;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  average,
  max,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
      <Typography className={classes.workflowHeader}>
        Number of total Workflows
      </Typography>
      <div className={classes.detailsDiv}>
        <img src="./icons/wfIcon.svg" alt="workflow" />
        <div className={classes.wfDiv}>
          <Typography>Avg amount of workflows</Typography>
          <div />
        </div>
      </div>
      <Typography className={classes.totWorkflow}>{194} workflows</Typography>
      <Typography className={classes.wfText}>
        AVG is calculated from the max of workflows
      </Typography>
    </Paper>
  );
};

export default WorkflowCard;
