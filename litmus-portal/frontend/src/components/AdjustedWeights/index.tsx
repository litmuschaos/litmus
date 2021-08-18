import { Typography } from '@material-ui/core';
import React from 'react';
import capitalize from '../../utils/capitalize';
import LinearProgressBar from '../ProgressBar/LinearProgressBar';
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
          <>{testName.split('-').map((text) => `${capitalize(text)} `)}</>-{' '}
          <span className={classes.points}>{testValue} points</span>
        </Typography>
      </div>

      <div className={classes.progressbarDiv}>
        <LinearProgressBar width={0.2} value={testValue} />
      </div>
    </div>
  );
};
export default AdjustedWeights;
