import React, { useEffect } from 'react';
import { Typography, Avatar } from '@material-ui/core';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CancelSharpIcon from '@material-ui/icons/CancelSharp';
import useStyles from './styles';

interface StatusProps {
  status: string;
}

const CustomStatus: React.FC<StatusProps> = ({ status }) => {
  const classes = useStyles();
  const [label, setLabel] = React.useState(' ');
  useEffect(() => {
    if (status === 'Passed') {
      return setLabel(classes.passed);
    }
    return setLabel(classes.failed);
  }, [status, classes.failed, classes.passed]);
  return (
    <>
      <div className={label}>
        {status === 'Passed' ? (
          <Avatar
            style={{
              backgroundColor: 'white',
              width: 15,
              height: 15,
            }}
            className={classes.miniIcons}
          >
            <CheckCircleSharpIcon
              style={{ color: '#109B67', width: 15, height: 15 }}
            />
          </Avatar>
        ) : (
          <Avatar
            style={{
              backgroundColor: 'white',
              width: 15,
              height: 15,
            }}
            className={classes.miniIcons}
          >
            <CancelSharpIcon
              style={{ color: '#CA2C2C', width: 15, height: 15 }}
            />
          </Avatar>
        )}
        <Typography className={classes.statusFont}>{status}</Typography>
      </div>
    </>
  );
};
export default CustomStatus;
