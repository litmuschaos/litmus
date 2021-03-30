import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import useStyle from './styles';

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
  const resultValue = ((value as number) / (maxValue as number)) * 100;

  const classes = useStyle();

  return (
    <LinearProgress
      variant="determinate"
      value={resultValue}
      classes={
        isInTable
          ? resultValue > 60
            ? {
                root: classes.root,
                barColorPrimary: classes.greenColorPrimary,
              }
            : resultValue > 30
            ? {
                root: classes.root,
                barColorPrimary: classes.yellowColorPrimary,
              }
            : {
                root: classes.root,
                barColorPrimary: classes.redColorPrimary,
              }
          : {}
      }
    />
  );
};

export default AnalyticsLinearProgressBar;
