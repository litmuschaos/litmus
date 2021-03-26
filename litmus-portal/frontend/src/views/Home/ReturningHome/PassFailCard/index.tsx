import { Paper, Typography } from '@material-ui/core';
import { PassFailBar } from 'litmus-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface PassedVsFailedProps {
  passed: number;
}

const PassFailCard: React.FC<PassedVsFailedProps> = ({ passed }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
      <div className={classes.detailsDiv}>
        <Typography className={classes.workflowHeader}>
          Passed vs Failed
        </Typography>
      </div>
      <div style={{ height: '4rem', width: '18rem' }}>
        <PassFailBar passPercentage={passed} />
      </div>
      <Typography className={classes.wfText}>
        Statistics taken from all test results
      </Typography>
    </Paper>
  );
};

export default PassFailCard;
