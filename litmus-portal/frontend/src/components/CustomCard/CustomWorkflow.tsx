import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import useStyles from './styles';

const CustomWorkflowCard: React.FC = () => {
  const classes = useStyles();

  return (
    <Tooltip title="Coming Soon !">
      <div className={classes.customCard}>
        <img src="./icons/custom_workflow.svg" alt="Custom Workflow Icon" />
        <Typography className={classes.customWorkflowContent}>
          Create your own workflow
        </Typography>
      </div>
    </Tooltip>
  );
};
export default CustomWorkflowCard;
