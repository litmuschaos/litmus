import { CircularProgress, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import Center from '../../containers/layouts/Center';

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    color: theme.palette.secondary.dark,
  },
}));

const Loader = () => {
  const classes = useStyles();
  return (
    <Center>
      <CircularProgress className={classes.spinner} />
    </Center>
  );
};

export default Loader;
