import React from 'react';
import { Typography } from '@material-ui/core';
import LinearProgressBar from '../LinearProgressBar';

interface AdjustedWeightsProps {
  testName: string;
  testValue: number;
}

// Displays the details of adjusted weights including test name,points and a progress bar for points.
const AdjustedWeights: React.FC<AdjustedWeightsProps> = ({
  testName,
  testValue,
}) => {
  return (
    <div
      style={{
        marginLeft: 30,
        marginTop: 30,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '17.5625rem',
          marginBottom: 21,
        }}
      >
        <Typography style={{ fontSize: '0.875rem' }}>
          {testName} - {testValue} points
        </Typography>
      </div>

      <div style={{ width: '17.5625rem' }}>
        <LinearProgressBar value={testValue} />
      </div>
    </div>
  );
};
export default AdjustedWeights;
