import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface AverageResilienceScoreProps {
  value: number;
}

const AverageResilienceScore: React.FC<AverageResilienceScoreProps> = ({
  value,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [progress, setProgress] = useState<number>(0);

  /*
    Cutting a regular progres indicator into half
    and converting value to fit in that range
    Ex - 100 becomes half -> 100/2 = 50
    So full range of the progress indicator is 50    
  */
  useEffect(() => {
    setProgress(value / 2);
  }, [value]);

  return (
    <Paper className={classes.root} variant="outlined">
      <Typography className={classes.headerMain}>
        {t('homeView.averageResilienceScore.header')}
      </Typography>
      <Box className={classes.progressBox}>
        <div className={classes.progressIndicatorDiv}>
          <CircularProgress
            variant="static"
            thickness={2}
            size={200}
            value={progress}
            className={classes.progressIndicator}
          />
        </div>
        <div className={classes.progressIndicatorCompleterDiv}>
          <div className={classes.progressIndicatorCompleterDivTransformer}>
            <CircularProgress
              variant="static"
              thickness={2}
              size={200}
              value={(100 - value) / 2}
              className={classes.progressIndicatorCompleter}
            />
          </div>
        </div>
        <Box className={classes.progressLabel}>
          <img
            src="/icons/avgResilience.png"
            alt="Progress Icon"
            className={classes.progressIcon}
            data-cy="progressIcon"
          />
          <Typography
            variant="caption"
            component="div"
            className={classes.progressText}
            data-cy="progressValue"
          >{`${Math.round(value)}%`}</Typography>
        </Box>
      </Box>
      <Typography variant="body2" className={classes.testResultDesc}>
        {t('homeView.averageResilienceScore.desc')}
      </Typography>
    </Paper>
  );
};

export default AverageResilienceScore;
