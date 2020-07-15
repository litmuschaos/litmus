import { Line } from 'rc-progress';
import React, { useEffect, useState } from 'react';

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
  const changeColor = () => {
    if (resultValue <= 30) {
      return setColor('#CA2C2C');
    }
    if (resultValue <= 60) {
      return setColor('#F6B92B');
    }
    return setColor('#109B67');
  };
  useEffect(() => {
    if (isDefault === true) {
      return setColor('#5B44BA');
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
