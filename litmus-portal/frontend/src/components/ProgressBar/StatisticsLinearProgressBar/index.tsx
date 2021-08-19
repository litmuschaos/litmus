import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import useStyle from './styles';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
  isInTable: boolean;
}

const StatisticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
  isInTable,
}) => {
  const resultValue = ((value as number) / (maxValue as number)) * 100;

  const classes = useStyle();

  return (
    <LinearProgress
      variant="determinate"
      value={resultValue}
      style={{
        height: '0.2rem',
      }}
      classes={{
        colorPrimary: isInTable
          ? resultValue > 60
            ? classes.greenColorSecondary
            : resultValue > 30
            ? classes.yellowColorSecondary
            : classes.redColorSecondary
          : classes.greenColorSecondary,
        barColorPrimary: isInTable
          ? resultValue > 60
            ? classes.greenColorPrimary
            : resultValue > 30
            ? classes.yellowColorPrimary
            : classes.redColorPrimary
          : classes.greenColorSecondary,
      }}
    />
  );
};

export default StatisticsLinearProgressBar;
