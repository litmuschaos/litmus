import { Typography } from '@material-ui/core';
import React from 'react';
import Scaffold from '../../../../containers/layouts/Scaffold';
import useStyles from './styles';

const ScheduleWorkflow = () => {
  const classes = useStyles();
  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.headerDiv}>
          <Typography variant="h3" gutterBottom>
            Schedule a new chaos workflow
          </Typography>
        </div>
        <div className={classes.workflowDiv}>
          <Typography variant="h4">
            <strong>Experiment information</strong>
          </Typography>
          <Typography variant="h6">
            <strong>
              Tap finish to the end or you can add a new experiments and edit
              current added
            </strong>
          </Typography>
        </div>
      </div>
    </Scaffold>
  );
};

export default ScheduleWorkflow;
