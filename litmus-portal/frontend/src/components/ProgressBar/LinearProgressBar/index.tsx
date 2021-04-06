import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import useStyle from './styles';

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

  const classes = useStyle();

  return (
    <LinearProgress
      variant="determinate"
      value={resultValue}
      style={{
        height: `${width}rem`,
        borderRadius: '5rem',
      }}
      classes={{
        colorPrimary: isDefault
          ? classes.greenColorSecondary
          : resultValue > 60
          ? classes.greenColorSecondary
          : resultValue > 30
          ? classes.yellowColorSecondary
          : classes.redColorSecondary,
        barColorPrimary: isDefault
          ? classes.greenColorPrimary
          : resultValue > 60
          ? classes.greenColorPrimary
          : resultValue > 30
          ? classes.yellowColorPrimary
          : classes.redColorPrimary,
      }}
    />
  );
};

export default LinearProgressBar;
