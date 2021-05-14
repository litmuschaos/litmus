import { Typography } from '@material-ui/core';
import React from 'react';
import BackButton from '../../components/Button/BackButton';
import DashboardList from '../../components/PreconfiguredDashboards/data';
import Scaffold from '../../containers/layouts/Scaffold';
import DashboardCards from '../../views/Analytics/ApplicationDashboards/Cards/dashBoardCards';
import useStyles from './styles';

const DashboardSelectPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.button}>
          <BackButton />
        </div>
        <Typography className={classes.heading}>
          <strong>Select a dashboard</strong>
        </Typography>
        <Typography className={classes.description}>
          Select a dashboard from given types for real time monitoring.
        </Typography>
        <div className={classes.cards}>
          <DashboardCards dashboards={DashboardList} />
        </div>
      </div>
    </Scaffold>
  );
};

export default DashboardSelectPage;
