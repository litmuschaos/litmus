import { Line } from 'rc-progress';
import React, { useEffect, useState } from 'react';

interface LinearProgressBarProps {
  value: number;
  maxValue: number;
}

const AnalyticsLinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  maxValue,
}) => {
  const [color, setColor] = useState(' ');
  const width: number = 2;
  const resultValue = ((value as number) / (maxValue as number)) * 100;
  useEffect(() => {
    return setColor('#5B44BA');
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

export default AnalyticsLinearProgressBar;
