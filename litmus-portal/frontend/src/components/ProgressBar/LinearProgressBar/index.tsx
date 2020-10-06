import React from 'react';
import { withStyles, lighten, LinearProgress, Theme } from '@material-ui/core';

interface LinearProgressBarProps {
  value: number | number[];
  isDefault?: boolean;
  width: number;
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

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  isDefault,
  width,
}) => {
  const resultValue = (value as number) * 10;
  const newWidth = width * 10 || 20;
  const lowerLimit = 30;
  const upperLimit = 60;
  if (isDefault) {
    if (resultValue <= lowerLimit) {
      return (
        <RedLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            borderRadius: newWidth,
            height: newWidth,
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
            borderRadius: newWidth,
            height: newWidth,
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
            borderRadius: newWidth,
            height: newWidth,
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
        borderRadius: newWidth,
        height: newWidth,
      }}
    />
  );
};

export default LinearProgressBar;
