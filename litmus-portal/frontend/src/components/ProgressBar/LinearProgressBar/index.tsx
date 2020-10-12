import { Line } from 'rc-progress';
import React from 'react';
import { useTheme } from '@material-ui/core/styles';

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
  const theme = useTheme();

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

export default LinearProgressBar;
