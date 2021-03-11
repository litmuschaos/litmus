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

  const styleClass = useStyle();

  return (
    <LinearProgress
      variant="determinate"
      value={resultValue}
      classes={
        isInTable
          ? resultValue > 60
            ? {
                root: styleClass.root,
                barColorPrimary: styleClass.greenColorPrimary,
              }
            : resultValue > 30
            ? {
                root: styleClass.root,
                barColorPrimary: styleClass.yellowColorPrimary,
              }
            : {
                root: styleClass.root,
                barColorPrimary: styleClass.redColorPrimary,
              }
          : {}
      }
    />
  );
};

export default AnalyticsLinearProgressBar;
