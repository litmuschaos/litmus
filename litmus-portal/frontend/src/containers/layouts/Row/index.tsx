import { makeStyles } from '@material-ui/core';
import React from 'react';

interface StyleProps {
  justifyContent?: string;
}

const useStyles = makeStyles({
  row: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: (props: StyleProps) => props.justifyContent ?? 'none',
  },
});

interface RowProps {
  className?: string;
  justifyContent?: string;
}

const Row: React.FC<RowProps> = ({ children, justifyContent, className }) => {
  const classes = useStyles({ justifyContent });
  return <div className={`${classes.row} ${className}`}>{children}</div>;
};

export default Row;
