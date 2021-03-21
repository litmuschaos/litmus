/* eslint-disable no-return-assign */
import { QuickActionCard } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../redux/configureStore';

const ReturningHomeQuickActionCard: React.FC = () => {
  const { t } = useTranslation();
  const quickActionDataAnalytics = [
    {
      src: '/icons/calendarWorkflowIcon.svg',
      alt: 'workflow',
      onClick: () => history.push('/create-workflow'),
      text: t('quickActionCard.scheduleWorkflow'),
    },
    {
      src: '/icons/target.svg',
      alt: 'agent',
      onClick: () => history.push('/target-connect'),
      text: t('quickActionCard.addAgent'),
    },
    {
      src: '/icons/inviteTeam.svg',
      alt: 'invite',
      onClick: () => history.push('/settings'),
      text: t('quickActionCard.inviteTeamMember'),
    },
  ];
  return (
    <QuickActionCard
      quickActions={quickActionDataAnalytics}
      title={t('quickActionCard.quickActions')}
    />
  );
};
export { ReturningHomeQuickActionCard };
