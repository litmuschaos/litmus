import { Line } from 'rc-progress';
import React from 'react';

interface ColouredProgressBarProps {
  value: number | number[];
  color: string;
  width: number;
}

const ColouredProgressBar: React.FC<ColouredProgressBarProps> = ({
  value,
  color,
  width,
}) => {
  const resultValue = value as number;
  return (
    <Line
      percent={resultValue}
      strokeWidth={width}
      trailWidth={width}
      strokeColor={color}
    />
  );
};

export default ColouredProgressBar;
