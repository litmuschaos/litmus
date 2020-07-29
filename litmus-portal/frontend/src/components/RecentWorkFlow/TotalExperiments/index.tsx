import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import useStyles from './styles';
import LinearProgressBar from '../../ProgressBar/LinearProgressBar';

interface TotalWorkflowProps {
  workflow: number;
  average: number;
}

const TotalExperiments: React.FC<TotalWorkflowProps> = ({
  workflow,
  average,
}) => {
  const classes = useStyles();
  return (
    <Paper variant="outlined" className={classes.paper}>
      <Typography variant="h6" gutterBottom className={classes.heading}>
        <strong>Number of total Workflows</strong>
      </Typography>
      <div className={classes.contentDiv}>
        <img src="icons/ellipse.png" alt="Ellipse Icon" />
        <div className={classes.mainDiv}>
          <Typography variant="subtitle2">
            <strong>AVG amount of workflows:</strong>
          </Typography>
          <Typography
            variant="caption"
            display="block"
            gutterBottom
            className={classes.avgCount}
          >
            {average} per week
          </Typography>
          <LinearProgressBar value={average} isDefault />
        </div>
      </div>
      <Typography variant="h5" gutterBottom className={classes.workflow}>
        <strong>{workflow} workflows</strong>
      </Typography>
      <Typography variant="body2" className={classes.avgDesc}>
        AVG is calculated from the max of workflows.
      </Typography>
    </Paper>
  );
};

export default TotalExperiments;
