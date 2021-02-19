import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  center: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface CenterProps {
  className?: string;
}

const Center: React.FC<CenterProps> = ({ children, className }) => {
  const classes = useStyles();
  return <div className={`${classes.center} ${className}`}>{children}</div>;
};

export default Center;
