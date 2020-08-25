import React from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';

interface CustomWorkflowCardProps {
  handleClick: () => void;
}

const CustomWorkflowCard: React.FC<CustomWorkflowCardProps> = ({
  handleClick,
}) => {
  const classes = useStyles();

  return (
    <div
      role="button"
      className={classes.customCard}
      onClick={handleClick}
      onKeyPress={() => {}}
      tabIndex={0}
    >
      <img src="./icons/custom_workflow.svg" alt="Custom Workflow Icon" />
      <Typography className={classes.customWorkflowContent}>
        Create your own workflow
      </Typography>
    </div>
  );
};
export default CustomWorkflowCard;
