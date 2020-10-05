import React from 'react';
import { withStyles, lighten, LinearProgress, Theme } from '@material-ui/core';

interface LinearProgressBarProps {
  value: number | number[];
  isDefault?: boolean;
  width: number;
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

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  isDefault,
  width,
}) => {
  const resultValue = (value as number) * 10;
  const defaultSize = 20;
  if (isDefault) {
    if (resultValue <= 30) {
      return (
        <RedLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            height: defaultSize | (width * 10),
            borderRadius: defaultSize | (width * 10),
          }}
        />
      );
    } else if (resultValue > 30 && resultValue <= 60) {
      return (
        <YellowLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            height: defaultSize | (width * 10),
            borderRadius: defaultSize | (width * 10),
          }}
        />
      );
    } else {
      return (
        <GreenLinearProgress
          value={resultValue}
          variant="determinate"
          style={{
            height: defaultSize | (width * 10),
            borderRadius: defaultSize | (width * 10),
          }}
        />
      );
    }
  }
  return (
    <LinearProgress
      value={0}
      variant="determinate"
      style={{ height: defaultSize | width }}
    />
  );
};

export default LinearProgressBar;
