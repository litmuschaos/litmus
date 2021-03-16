/* eslint-disable no-return-assign */
import { QuickActionCard } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';

const AnalyticsQuickActionCard: React.FC = () => {
  const { t } = useTranslation();
  const projectID = getProjectID();
  const userRole = getProjectRole();
  const quickActionDataAnalytics = [
    {
      src: './icons/addDashboard.svg',
      alt: 'dashboard',
      onClick: () => {
        history.push({
          pathname: '/analytics/dashboard/select',
          search: `?projectID=${projectID}&projectRole=${userRole}`,
        });
      },
      text: t('quickActionCard.addDashboard'),
    },
    {
      src: './icons/addDataSource.svg',
      alt: 'data source',
      onClick: () => {
        history.push({
          pathname: '/analytics/datasource/select',
          search: `?projectID=${projectID}&projectRole=${userRole}`,
        });
      },
      text: t('quickActionCard.addDataSource'),
    },
    {
      src: './icons/calendarWorkflowIcon.svg',
      alt: 'workflow',
      onClick: () => {
        history.push({
          pathname: '/create-workflow',
          search: `?projectID=${projectID}&projectRole=${userRole}`,
        });
      },
      text: t('quickActionCard.scheduleWorkflow'),
    },
    {
      src: './icons/target.svg',
      alt: 'agent',
      onClick: () => {
        history.push({
          pathname: '/target-connect',
          search: `?projectID=${projectID}&projectRole=${userRole}`,
        });
      },
      text: t('quickActionCard.addAgent'),
    },
    // TODO: settings only accessible by Owner
    {
      src: './icons/inviteTeam.svg',
      alt: 'invite',
      onClick: () => {
        history.push({
          pathname: '/settings',
          search: `?projectID=${projectID}&projectRole=${userRole}`,
        });
      },
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
