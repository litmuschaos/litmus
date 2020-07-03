import { Line } from 'rc-progress';
import React, { useEffect, useState } from 'react';

interface LinearProgressBarProps {
  value: number | number[];
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({ value }) => {
  const [color, setColor] = useState(' ');
  const width: number = 2;
  const resultValue = (value as number) * 10;
  useEffect(() => {
    if (resultValue <= 30) {
      return setColor('#CA2C2C');
    }
    if (resultValue <= 60) {
      return setColor('#F6B92B');
    }
    return setColor('#109B67');
  }, []);
  return (
    <div style={{ width: 150 }}>
      <Line
        percent={resultValue}
        strokeWidth={width}
        trailWidth={width}
        strokeColor={color}
      />
    </div>
  );
};

export default LinearProgressBar;
