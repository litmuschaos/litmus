import { Paper, Avatar, Typography } from '@material-ui/core';
import React from 'react';
import moment from 'moment';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CancelSharpIcon from '@material-ui/icons/CancelSharp';
import TimelineSharpIcon from '@material-ui/icons/TimelineSharp';
import useStyles from './styles';

interface PopOverProps {
  testsPassed: number;
  testsFailed: number;
  resilienceScore: number;
  testDate: string;
  xLoc: number;
  yLoc: number;
}

const PopOver: React.FC<PopOverProps> = ({
  testsPassed,
  testsFailed,
  resilienceScore,
  testDate,
  xLoc,
  yLoc,
}) => {
  const styleProps = { xLoc, yLoc };
  const classes = useStyles(styleProps);

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const dateTime = {
      date: moment(updated).format('DD MMM YYYY'),
      time: moment(updated).format('HH:mm'),
    };
    return dateTime;
  };

  return (
    <div className={classes.modalContainer}>
      <Paper elevation={3} className={classes.root}>
        <div className={classes.date}>
          <Typography className={classes.testDate}>
            <Avatar className={`${classes.miniIcons} ${classes.dateIcon}`}>
              <img src="/icons/calenderAnalytics.svg" alt="Calender" />
            </Avatar>
            Tests date: {formatDate(testDate).date} <br />
            Tests time: {formatDate(testDate).time}
          </Typography>
        </div>
        <Typography className={classes.resilienceScore}>
          <Avatar
            className={`${classes.miniIcons} ${classes.resilienceScoreIcon}`}
          >
            <TimelineSharpIcon className={classes.timeLineIcon} />
          </Avatar>
          Resilience score - {resilienceScore}%
        </Typography>
        <Typography className={classes.testsPassed}>
          <Avatar className={`${classes.miniIcons} ${classes.passedIcon}`}>
            <CheckCircleSharpIcon className={classes.checkMarkIcon} />
          </Avatar>
          Passed tests - {testsPassed}
        </Typography>
        <Typography className={classes.testsFailed}>
          <Avatar className={`${classes.miniIcons} ${classes.failedIcon}`}>
            <CancelSharpIcon className={classes.cancelMarkIcon} />
          </Avatar>
          Failed tests - {testsFailed}
        </Typography>
      </Paper>
    </div>
  );
};

export default PopOver;
