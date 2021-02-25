import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

const TuneWorkflow: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      {/* Header */}
      <div className={classes.headerWrapper}>
        <Typography className={classes.heading}>
          {t('createWorkflow.tuneWorkflow.header')}
        </Typography>
        <Typography className={classes.description}>
          {t('createWorkflow.tuneWorkflow.selectedWorkflowInfo')}
          <br />
          {t('createWorkflow.tuneWorkflow.description')}
        </Typography>
      </div>
      {/* Experiment Details */}
    </div>
  );
};

export default TuneWorkflow;
