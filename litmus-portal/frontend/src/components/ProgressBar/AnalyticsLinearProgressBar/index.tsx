import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
  isInTable: boolean;
}

const AnalyticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
  isInTable,
}) => {
  const width: number = 15; //default width
  const resultValue = ((value as number) / (maxValue as number)) * 100;

  const barStyle = makeStyles(() => ({
    root: {
      borderRadius: 5,
      height: width,
    },
    barColorPrimary: {
      backgroundColor:
        resultValue > 60 ? '#109B67' : resultValue > 30 ? '#F6B92B' : '#CA2C2C',
    },
  }));

  const styleClass = barStyle();

  return (
    <LinearProgress
      variant="determinate"
      value={resultValue}
      classes={
        isInTable
          ? {
              root: styleClass.root,
              barColorPrimary: styleClass.barColorPrimary,
            }
          : {}
      }
    />
  );
};

export default AnalyticsLinearProgressBar;
