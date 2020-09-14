import { CircularProgress, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import Center from '../../containers/layouts/Center';

interface LoaderProps {
  size?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    color: (props) =>
      props !== undefined && props === true
        ? theme.palette.background.paper
        : theme.palette.secondary.dark,
  },
}));

const Loader: React.FC<LoaderProps> = ({ size }) => {
  const classes = useStyles();
  const defaultSize = 40;
  return (
    <Center>
      <CircularProgress
        className={classes.spinner}
        size={size || defaultSize}
      />
    </Center>
  );
};
export default Loader;
