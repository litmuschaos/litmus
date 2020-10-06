import React from 'react';
import { withStyles, lighten, LinearProgress, Theme } from '@material-ui/core';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
  isInTable: boolean;
}
const lightConstant = 0.5;

const RedLinearProgress = withStyles((theme: Theme) => ({
  bar: {
    backgroundColor: theme.palette.error.dark,
  },
  root: {
    backgroundColor: lighten(theme.palette.error.dark, lightConstant),
  },
}))(LinearProgress);

const YellowLinearProgress = withStyles((theme: Theme) => ({
  bar: {
    backgroundColor: theme.palette.warning.main,
  },
  root: {
    backgroundColor: lighten(theme.palette.warning.main, lightConstant),
  },
}))(LinearProgress);

const GreenLinearProgress = withStyles((theme: Theme) => ({
  bar: {
    backgroundColor: theme.palette.primary.dark,
  },
  root: {
    backgroundColor: lighten(theme.palette.primary.dark, lightConstant),
  },
}))(LinearProgress);

const AnalyticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
  isInTable,
}) => {
  const resultValue = ((value as number) / (maxValue as number)) * 100;
  const defaultSize = 20;
  const lowerLimit = 30;
  const upperLimit = 60;

  if (isInTable) {
    if (resultValue <= lowerLimit) {
      return (
        <RedLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            borderRadius: defaultSize,
            height: defaultSize,
          }}
        />
      );
    }
    if (resultValue > lowerLimit && resultValue <= upperLimit) {
      return (
        <YellowLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            borderRadius: defaultSize,
            height: defaultSize,
          }}
        />
      );
    }
    if (resultValue > upperLimit) {
      return (
        <GreenLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            borderRadius: defaultSize,
            height: defaultSize,
          }}
        />
      );
    }
  }

  return (
    <LinearProgress
      value={0}
      variant="determinate"
      style={{
        borderRadius: defaultSize,
        height: defaultSize,
      }}
    />
  );
};

export default AnalyticsLinearProgressBar;
