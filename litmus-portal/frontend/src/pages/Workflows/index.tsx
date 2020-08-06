import { Typography } from '@material-ui/core';
import React from 'react';
import CustomStepper from '../../components/CustomStepper';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './styles';

const Workflows = () => {
  const classes = useStyles();
  return (
    <Scaffold>
      <Typography className={classes.heading} display="inline">
        Schedule a new <strong>chaos workflow</strong>
      </Typography>
      <CustomStepper />
    </Scaffold>
  );
};

export default Workflows;
