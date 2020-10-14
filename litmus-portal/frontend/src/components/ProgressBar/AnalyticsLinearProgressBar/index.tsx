import { Line } from 'rc-progress';
import React from 'react';
import { useTheme } from '@material-ui/core/styles';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
  isInTable: boolean;
}
const AnalyticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
  isInTable,
}) => 
{
  const resultValue = ((value as number) / (maxValue as number)) * 100;
  const defaultSize = 20;
  const { palette } = useTheme();

  return (
    <Line
      percent={resultValue}
      strokeWidth={width}
      trailWidth={width}
      strokeColor={
        isDefault
          ? theme.palette.secondary.dark
          : resultValue > 30 && resultValue <= 60
          ? theme.palette.warning.main
          : resultValue > 60
          ? theme.palette.primary.dark
          : theme.palette.error.dark
      }
    />
  );
};