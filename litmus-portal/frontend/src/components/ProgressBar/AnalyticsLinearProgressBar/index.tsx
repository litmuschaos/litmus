import React from 'react';
import { withStyles, lighten, LinearProgress, Theme } from '@material-ui/core';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
  isInTable: boolean;
}

const RedLinearProgress = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: lighten(theme.palette.error.dark, 0.5),
  },
  bar: {
    backgroundColor: theme.palette.error.dark,
  },
}))(LinearProgress);

const YellowLinearProgress = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: lighten(theme.palette.warning.main, 0.5),
  },
  bar: {
    backgroundColor: theme.palette.warning.main,
  },
}))(LinearProgress);

const GreenLinearProgress = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: lighten(theme.palette.success.dark, 0.5),
  },

  bar: {
    backgroundColor: theme.palette.success.dark,
  },
}))(LinearProgress);

const AnalyticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
  isInTable,
}) => {
  const resultValue = ((value as number) / (maxValue as number)) * 100;
  const defaultSize = 20;

  if (isInTable) {
    if (resultValue <= 30) {
      return (
        <RedLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            height: defaultSize,
            borderRadius: defaultSize,
          }}
        />
      );
    } else if (resultValue > 30 && resultValue <= 60) {
      return (
        <YellowLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            height: defaultSize,
            borderRadius: defaultSize,
          }}
        />
      );
    } else {
      return (
        <GreenLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            height: defaultSize,
            borderRadius: defaultSize,
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
        height: defaultSize,
        borderRadius: defaultSize,
      }}
    />
  );
};

export default AnalyticsLinearProgressBar;
