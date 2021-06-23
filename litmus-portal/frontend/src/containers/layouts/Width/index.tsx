import { makeStyles } from '@material-ui/core';
import React from 'react';

interface StyleProps {
  width: string;
}

const useStyles = makeStyles({
  width: {
    width: (props: StyleProps) => props.width,
    height: '100%',
  },
});

interface WidthProps {
  width: string;
  className?: string;
}

const Width: React.FC<WidthProps> = ({ children, width, className }) => {
  const classes = useStyles({ width });
  return <div className={`${classes.width} ${className}`}>{children}</div>;
};

export default Width;
