import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import UsageStats from '../../views/UsageStatistics/UsageStats';
import UsageTable from '../../views/UsageStatistics/UsageTable';
import useStyles from './styles';

const UsageStatistics = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Scaffold>
      <Typography variant="h3">{t('usage.usageHeader')}</Typography>
      <Typography className={classes.description}>
        {t('usage.usageSubtitle')}
      </Typography>
      <UsageStats />
      <br />
      <br />
      <Typography variant="h4">{t('usage.projectStatistics')}</Typography>
      <Typography className={classes.description}>
        {t('usage.projectSubtitle')}
      </Typography>
      <UsageTable />
    </Scaffold>
  );
};

export default UsageStatistics;
