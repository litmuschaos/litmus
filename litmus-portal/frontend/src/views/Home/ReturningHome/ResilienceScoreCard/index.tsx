import { IconButton, Paper, Typography } from '@material-ui/core';
import { RadialProgressChart } from 'litmus-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
interface AverageResilienceScoreProps {
  value: number;
}

const ResilienceScoreCard: React.FC<AverageResilienceScoreProps> = ({
  value,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
      <div className={classes.detailsDiv}>
        <Typography className={classes.workflowHeader}>
          Average Resilience Score
        </Typography>
        <div className={classes.flexEnd}>
          {t('home.NonAdmin.toProjects')}
          <IconButton className={classes.goToIcon}>
            <img src="./icons/goToIcon.svg" alt="go to" />
          </IconButton>
        </div>
      </div>
      <div style={{ height: '6.4rem', width: '11.125rem' }}>
        <RadialProgressChart
          className={classes.radialGraph}
          arcWidth={10}
          iconSize="1rem"
          imageSrc="./icons/radialIcon.svg"
          radialData={{
            value: value,
            label: 'pass',
            baseColor: '#5B44BA',
          }}
          semiCircle
          heading="Based on test results"
          unit="%"
        />
      </div>
    </Paper>
  );
};

export default ResilienceScoreCard;
