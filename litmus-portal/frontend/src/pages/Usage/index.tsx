import { Typography } from '@material-ui/core';
import React from 'react';
import Scaffold from '../../containers/layouts/Scaffold';
import UsageStats from '../../views/Usage/UsageStats';
import UsageTable from '../../views/Usage/UsageTable';
import useStyles from './styles';

const Usage = () => {
  const classes = useStyles();
  return (
    <Scaffold>
      <Typography variant="h3">Usage</Typography>
      <Typography className={classes.description}>
        Global and project level usage details. Available only to the admin
        user.
      </Typography>
      <UsageStats />
      <br />
      <br />
      <Typography variant="h4">Project Statistics</Typography>
      <Typography className={classes.description}>
        Includes the number of schedules, workflow runs and experiment run in
        each project.
      </Typography>
      <UsageTable />
    </Scaffold>
  );
};

export default Usage;
