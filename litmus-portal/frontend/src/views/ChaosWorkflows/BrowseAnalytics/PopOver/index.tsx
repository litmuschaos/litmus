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
  const formatDate = (date: any) => {
    const updated = new Date(date * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    return resDate;
  };

  return (
    <div className={classes.modalContainer}>
      <Paper elevation={3} className={classes.root}>
        <div className={classes.date}>
          <CustomTypography className={classes.testDate}>
            <Avatar
              style={{
                backgroundColor: '#109B67',
                width: 20,
                height: 22,
              }}
              className={classes.miniIcons}
            >
              <DateRangeSharpIcon
                style={{
                  color: 'white',
                  width: 20,
                  height: 22,
                }}
              />
            </Avatar>
            Tests date: {formatDate(testDate)}
          </CustomTypography>
        </div>
        <WeightedTypography className={classes.resilienceScore}>
          <Avatar
            style={{
              backgroundColor: '#F6B92B',
              width: 18,
              height: 18,
            }}
            className={classes.miniIcons}
          >
            <TimelineSharpIcon
              style={{
                color: 'white',
                width: 15,
                marginLeft: 2,
                height: 18,
              }}
            />
          </Avatar>
          Resilience score - {resilienceScore}%
        </WeightedTypography>
        <WeightedTypography className={classes.testsPassed}>
          <Avatar
            style={{
              backgroundColor: 'white',
              width: 20,
              height: 20,
            }}
            className={classes.miniIcons}
          >
            <CheckCircleSharpIcon
              style={{ color: '#109B67', width: 20, height: 20 }}
            />
          </Avatar>
          Passed tests - {testsPassed}
        </WeightedTypography>
        <WeightedTypography className={classes.testsFailed}>
          <Avatar
            style={{
              backgroundColor: 'white',
              width: 20,
              height: 20,
            }}
            className={classes.miniIcons}
          >
            <CancelSharpIcon
              style={{ color: '#CA2C2C', width: 20, height: 20 }}
            />
          </Avatar>
          Failed tests - {testsFailed}
        </WeightedTypography>
      </Paper>
    </div>
  );
};

export default PopOver;
