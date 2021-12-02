import React from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';
import LinearProgressBar from '../../../components/ProgressBar/LinearProgressBar';

interface ExperimentPointsProps {
  expName: string;
  weight: number;
}

const ExperimentPoints: React.FC<ExperimentPointsProps> = ({
  expName,
  weight,
}) => {
  const classes = useStyles(weight);
  return (
    <>
      <div className={classes.weightInfo}>
        <Typography data-cy="expName">{expName}</Typography>
        <Typography className={classes.points} data-cy="expWeight">
          {weight === 1 || 0 ? `${weight} point` : `${weight} points`}
        </Typography>
      </div>
      <LinearProgressBar width={0.2} value={weight} />
    </>
  );
};

export default ExperimentPoints;
