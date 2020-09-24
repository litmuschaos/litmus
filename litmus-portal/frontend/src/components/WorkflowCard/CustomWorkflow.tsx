import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface CustomWorkflowCardProps {
  handleClick: () => void;
}

const CustomWorkflowCard: React.FC<CustomWorkflowCardProps> = ({
  handleClick,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

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
        {t('customWorkflowCard.customWorkflow')}
      </Typography>
    </div>
  );
};
export default CustomWorkflowCard;
