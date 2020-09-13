import { Paper, Avatar } from '@material-ui/core';
import React from 'react';
import moment from 'moment';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CancelSharpIcon from '@material-ui/icons/CancelSharp';
import TimelineSharpIcon from '@material-ui/icons/TimelineSharp';
import DateRangeSharpIcon from '@material-ui/icons/DateRangeSharp';
import useStyles, { CustomTypography, WeightedTypography } from './styles';

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
    const resDate = moment(updated).format('DD MMM YYYY');
    return resDate;
  };

  return (
    <div className={classes.modalContainer}>
      <Paper elevation={3} className={classes.root}>
        <div className={classes.date}>
          <CustomTypography className={classes.testDate}>
            <Avatar className={`${classes.miniIcons} ${classes.dateIcon}`}>
              <DateRangeSharpIcon className={classes.dateRangeIcon} />
            </Avatar>
            Tests date: {formatDate(testDate)}
          </CustomTypography>
        </div>
        <WeightedTypography className={classes.resilienceScore}>
          <Avatar
            className={`${classes.miniIcons} ${classes.resilienceScoreIcon}`}
          >
            <TimelineSharpIcon className={classes.timeLineIcon} />
          </Avatar>
          Resilience score - {resilienceScore}%
        </WeightedTypography>
        <WeightedTypography className={classes.testsPassed}>
          <Avatar className={`${classes.miniIcons} ${classes.passedIcon}`}>
            <CheckCircleSharpIcon className={classes.checkMarkIcon} />
          </Avatar>
          Passed tests - {testsPassed}
        </WeightedTypography>
        <WeightedTypography className={classes.testsFailed}>
          <Avatar className={`${classes.miniIcons} ${classes.failedIcon}`}>
            <CancelSharpIcon className={classes.cancelMarkIcon} />
          </Avatar>
          Failed tests - {testsFailed}
        </WeightedTypography>
      </Paper>
    </div>
  );
};

export default PopOver;
