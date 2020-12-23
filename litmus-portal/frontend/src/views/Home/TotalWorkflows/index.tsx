import { Avatar } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AnalyticsLinearProgressBar from '../../../components/ProgressBar/AnalyticsLinearProgressBar';
import useStyles from './styles';

interface TotalWorkflowProps {
  workflow: number;
  average: number;
  max: number;
}

const TotalWorkflows: React.FC<TotalWorkflowProps> = ({
  workflow,
  average,
  max,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" className={classes.paper}>
      <Typography variant="h6" gutterBottom className={classes.heading}>
        <strong>{t('homeView.totalWorkflows.header')}</strong>
      </Typography>
      <div className={classes.contentDiv}>
        <Avatar className={classes.avatarStyle}>
          <img
            src="/icons/weeklyWorkflows.svg"
            alt="Ellipse Icon"
            className={classes.weeklyIcon}
          />
        </Avatar>
        <div className={classes.mainDiv}>
          <Typography variant="subtitle2">
            <strong>{t('homeView.totalWorkflows.subtitle')}:</strong>
          </Typography>
          <div className={classes.runsFlex}>
            <Typography
              variant="caption"
              display="block"
              gutterBottom
              className={classes.avgCount}
            >
              {average} {t('homeView.totalWorkflows.perWeek')}
            </Typography>
            <Typography
              variant="caption"
              display="inline"
              className={classes.maxCount}
            >
              {max}
            </Typography>
          </div>
          <AnalyticsLinearProgressBar
            value={average}
            maxValue={max}
            isInTable={false}
          />
        </div>
      </div>
      <Typography variant="h5" gutterBottom className={classes.workflow}>
        <strong>
          {workflow > 1 ? `${workflow} workflows` : `${workflow} workflow`}
        </strong>
      </Typography>
      <Typography variant="body2" className={classes.avgDesc}>
        {t('homeView.totalWorkflows.desc')}
      </Typography>
    </Paper>
  );
};

export default TotalWorkflows;
