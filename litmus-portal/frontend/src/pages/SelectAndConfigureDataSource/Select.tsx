import { Typography } from '@material-ui/core';
import React from 'react';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import DataSourceList from '../../views/Analytics/DataSources/Cards/data';
import DataSourceCards from '../../views/Analytics/DataSources/Cards/dataSourceCards';
import useStyles from './styles';

const DataSourceSelectPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.button}>
          <BackButton />
        </div>
        <Typography className={classes.heading}>
          <strong>Select a data source</strong>
        </Typography>
        <Typography className={classes.description}>
          Connect or select data source for your agents and go analytics.
        </Typography>
        <div className={classes.cards}>
          <DataSourceCards dataSources={DataSourceList} />
        </div>
      </div>
    </Scaffold>
  );
};

export default DataSourceSelectPage;
