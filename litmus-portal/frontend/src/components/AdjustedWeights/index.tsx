import React from 'react';
import { Typography } from '@material-ui/core';
import LinearProgressBar from '../LinearProgressBar';
import useStyles from './styles';

interface AdjustedWeightsProps {
  testName: string;
  testValue: number;
}

/* Displays the details of adjusted weights including test name,
points and a progress bar for points. */

const AdjustedWeights: React.FC<AdjustedWeightsProps> = ({
  testName,
  testValue,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.outerDiv}>
      <div className={classes.innerDiv}>
        <Typography className={classes.typo}>
          {testName} - {testValue} points
        </Typography>
      </div>

      <div>
        <LinearProgressBar value={testValue} />
      </div>
    </div>
  );
};
export default AdjustedWeights;
