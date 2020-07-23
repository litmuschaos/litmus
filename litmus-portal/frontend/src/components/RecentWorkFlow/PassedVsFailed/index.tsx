import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
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
    <Paper className={classes.root}>
      <Box width="100%" className={classes.boxMain}>
        <Typography className={classes.headerMain}>Passed Vs Failed</Typography>
        <Box className={classes.boxDisplay}>
          <Box width={`${passedValue}%`} className={classes.passedBox}>
            {/* Render an empty div if props is not
            passed */}
            {passedValue === 0 ? (
              <div />
            ) : (
              <img
                src="./icons/Pass.png"
                alt="Passed Icon"
                className={classes.passedIcon}
                data-cy="passIcon"
              />
            )}
          </Box>
          <Box width={`${failedValue}%`} className={classes.failedBox}>
            {/* Render an empty div if props is not
            passed */}
            {failedValue === 0 ? (
              <div />
            ) : (
              <img
                src="./icons/Fail.png"
                alt="Failed Icon"
                className={classes.failedIcon}
                data-cy="failedIcon"
              />
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
      </Box>
    </Paper>
  );
};

export default PassedVsFailed;
