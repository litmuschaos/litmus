/* eslint-disable no-return-assign */
import { QuickActionCard } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../../redux/configureStore';

const AnalyticsQuickActionCard: React.FC = () => {
  const { t } = useTranslation();
  const quickActionDataAnalytics = [
    {
      src: './icons/addDashboard.svg',
      alt: 'dashboard',
      onClick: () => history.push('/analytics/dashboard/select'),
      text: t('quickActionCard.addDashboard'),
    },
    {
      src: './icons/addDataSource.svg',
      alt: 'data source',
      onClick: () => history.push('/analytics/datasource/select'),
      text: t('quickActionCard.addDataSource'),
    },
    {
      src: './icons/calendarWorkflowIcon.svg',
      alt: 'workflow',
      onClick: () => history.push('/create-workflow'),
      text: t('quickActionCard.scheduleWorkflow'),
    },
    {
      src: './icons/target.svg',
      alt: 'agent',
      onClick: () => history.push('/agent-connect'),
      text: t('quickActionCard.addAgent'),
    },
    {
      src: './icons/inviteTeam.svg',
      alt: 'invite',
      onClick: () => history.push('/settings'),
      text: t('quickActionCard.inviteTeamMember'),
    },

    {
      src: './icons/docs.svg',
      alt: 'docs',
      onClick: () =>
        (window.location.href = 'https://docs.litmuschaos.io/docs/getstarted'),
      text: t('quickActionCard.readDocs'),
    },
  ];
  return (
    <QuickActionCard
      quickActions={quickActionDataAnalytics}
      title="Quick Actions"
    />
  );
};
export { AnalyticsQuickActionCard };
