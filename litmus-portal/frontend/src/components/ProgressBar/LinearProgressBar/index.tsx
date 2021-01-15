import { useTheme } from '@material-ui/core/styles';
import { Line } from 'rc-progress';
import React from 'react';

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
          ? theme.palette.success.main
          : resultValue > 30 && resultValue <= 60
          ? theme.palette.warning.main
          : resultValue > 60
          ? theme.palette.success.main
          : theme.palette.error.main
      }
    />
  );
};

export default LinearProgressBar;
