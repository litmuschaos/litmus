import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Avatar } from '@material-ui/core';
import useStyles from './styles';
import AnalyticsLinearProgressBar from '../../../components/ProgressBar/AnalyticsLinearProgressBar';

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
  return (
    <Paper variant="outlined" className={classes.paper}>
      <Typography variant="h6" gutterBottom className={classes.heading}>
        <strong>Number of total Workflows</strong>
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
            <strong>AVG amount of workflows:</strong>
          </Typography>
          <div className={classes.runsFlex}>
            <Typography
              variant="caption"
              display="block"
              gutterBottom
              className={classes.avgCount}
            >
              {average} per week
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
          {workflow} {workflow > 1 ? 'workflows' : 'workflow'}
        </strong>
      </Typography>
      <Typography variant="body2" className={classes.avgDesc}>
        AVG is calculated from the max of workflows
      </Typography>
    </Paper>
  );
};

export default TotalWorkflows;
