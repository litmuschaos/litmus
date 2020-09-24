import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import useStyles from './styles';

interface StatusProps {
  status: string;
}

const CustomStatus: React.FC<StatusProps> = ({ status }) => {
  const classes = useStyles();
  const [label, setLabel] = React.useState(' ');
  useEffect(() => {
    if (status === 'Succeeded') {
      return setLabel(classes.completed);
    }
    if (status === 'Running' || status === 'Pending') {
      return setLabel(classes.running);
    }
    return setLabel(classes.failed);
  }, [status]);

  return (
    <>
      <div className={label}>
        <Typography className={classes.statusFont}>{status}</Typography>
      </div>
    </>
  );
};
export default CustomStatus;
