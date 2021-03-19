import { Typography } from '@material-ui/core';
import React from 'react';
import { InputField } from 'litmus-ui';
import useStyles from './styles';

const General = () => {
  const classes = useStyles();
  return (
    <div>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
      <br />
      <div className={classes.generalContainer}>
        <InputField label="Hub" value="Demo MyHub" />
        <br />
        <InputField label="Experiment Name" value="Experiment Name" />
      </div>
      <br />
    </div>
  );
};

export default General;
