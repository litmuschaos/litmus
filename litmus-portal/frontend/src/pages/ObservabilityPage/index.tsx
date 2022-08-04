import { Typography } from '@material-ui/core';
import React, { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { SuspenseLoader } from '../../components/SuspenseLoader';
import Wrapper from '../../containers/layouts/Wrapper';
import useStyles from './styles';

const WorkflowComparisonTable = lazy(
  () =>
    import(
      '../../views/Observability/WorkflowStatistics/WorkflowComparisonTable'
    )
);

const ObservabilityDashboard = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Wrapper>
      <section>
        <div className={classes.header}>
          <Typography className={classes.headingText}>
            {t('monitoringDashboard.heading')}
          </Typography>
        </div>
      </section>
      <SuspenseLoader style={{ height: '100vh' }}>
        <WorkflowComparisonTable />
      </SuspenseLoader>
    </Wrapper>
  );
};

export default ObservabilityDashboard;
