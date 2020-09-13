import { Line } from 'rc-progress';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';

interface LinearProgressBarProps {
  value: number | number[];
  isDefault?: boolean;
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  isDefault,
}) => {
  const [color, setColor] = useState(' ');
  const width: number = 2;
  const resultValue = (value as number) * 10;
  const theme = useTheme();
  const changeColor = () => {
    if (resultValue <= 30) {
      return setColor(theme.palette.error.dark);
    }
    if (resultValue <= 60) {
      return setColor(theme.palette.warning.main);
    }
    return setColor(theme.palette.primary.dark);
  };
  useEffect(() => {
    if (isDefault === true) {
      return setColor(theme.palette.secondary.dark);
    }
    return changeColor();
  }, [resultValue]);
  return (
    <Line
      percent={resultValue}
      strokeWidth={width}
      trailWidth={width}
      strokeColor={color}
    />
  );
};

export default LinearProgressBar;
