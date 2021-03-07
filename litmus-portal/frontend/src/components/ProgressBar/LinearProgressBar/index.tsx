import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

interface LinearProgressBarProps {
  value: number | number[];
  isDefault?: boolean;
  width: number;
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  isDefault,
  width,
}) => {
  const resultValue = (value as number) * 10;

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
        isDefault
          ? {
              root: styleClass.root,
              barColorPrimary: styleClass.barColorPrimary,
            }
          : {}
      }
    />
  );
};

export default LinearProgressBar;