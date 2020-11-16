import { Avatar } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CancelSharpIcon from '@material-ui/icons/CancelSharp';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface PassedVsFailedProps {
  passed?: number | undefined;
  failed?: number | undefined;
}

/*
  Reusable Passed Vs Failed Component
  Optional Params: passed, failed
*/

const PassedVsFailed: React.FC<PassedVsFailedProps> = ({ passed, failed }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [passedValue, setPassedValue] = useState<number>(0);
  const [failedValue, setFailedValue] = useState<number>(0);

  /*
    If props are passed then set it to the
    provided value else set it to 0
  */
  useEffect(() => {
    if (typeof passed === 'number') {
      setPassedValue(passed);
    }
    if (typeof failed === 'number') {
      setFailedValue(failed);
    }
  }, [passed, failed]);

  return (
    <Paper className={classes.root} variant="outlined">
      <Box width="100%" className={classes.boxMain}>
        <Typography className={classes.headerMain}>
          {t('homeView.passedVsFailed.header')}
        </Typography>
        <Box className={classes.boxDisplay}>
          <Box width={`${passedValue}%`} className={classes.passedBox}>
            {/* Render an empty div if props is not
            passed */}
            {passedValue < 11 ? (
              <div />
            ) : (
              <Avatar className={classes.passedIcon}>
                <CheckCircleSharpIcon className={classes.passedMark} />
              </Avatar>
            )}
          </Box>
          <Box width={`${failedValue}%`} className={classes.failedBox}>
            {/* Render an empty div if props is not
            passed */}
            {failedValue < 11 ? (
              <div />
            ) : (
              <Avatar className={classes.failedIcon}>
                <CancelSharpIcon className={classes.failedMark} />
              </Avatar>
            )}
          </Box>
        </Box>
        <Box className={classes.boxDisplay}>
          <Box className={classes.passedLabel} data-cy="passedValueID">
            {passedValue}%
          </Box>
          <Box className={classes.failedLabel} data-cy="failedValueID">
            {failedValue}%
          </Box>
        </Box>
        <Typography variant="body2" className={classes.statsDesc}>
          {t('homeView.passedVsFailed.desc')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default PassedVsFailed;
