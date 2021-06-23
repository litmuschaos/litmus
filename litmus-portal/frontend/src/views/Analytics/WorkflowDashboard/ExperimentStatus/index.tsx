import { Avatar } from '@material-ui/core';
import CancelSharpIcon from '@material-ui/icons/CancelSharp';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import { LightPills } from 'litmus-ui';
import React from 'react';
import useStyles from './styles';

interface StatusProps {
  status: string;
}

const ExperimentStatus: React.FC<StatusProps> = ({ status }) => {
  const classes = useStyles();

  return (
    <LightPills
      variant={
        status === 'Passed'
          ? 'success'
          : status === 'Failed'
          ? 'danger'
          : 'warning'
      }
      label={status}
      avatar={
        status === 'Passed' ? (
          <Avatar className={classes.miniIcons}>
            <CheckCircleSharpIcon
              className={`${classes.checkIcon} ${classes.stateIcon}`}
            />
          </Avatar>
        ) : status === 'Failed' ? (
          <Avatar className={classes.miniIcons}>
            <CancelSharpIcon
              className={`${classes.cancelIcon} ${classes.stateIcon}`}
            />
          </Avatar>
        ) : (
          <></>
        )
      }
    />
  );
};
export default ExperimentStatus;
