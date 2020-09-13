import { Line } from 'rc-progress';
import React from 'react';
import { useTheme } from '@material-ui/core/styles';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
}

const AnalyticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
}) => {
  const width: number = 2;
  const resultValue = ((value as number) / (maxValue as number)) * 100;

  const { palette } = useTheme();

  return (
    <Line
      percent={resultValue}
      strokeWidth={width}
      trailWidth={width}
      strokeColor={palette.secondary.dark}
    />
  );
};

export default AnalyticsLinearProgressBar;
