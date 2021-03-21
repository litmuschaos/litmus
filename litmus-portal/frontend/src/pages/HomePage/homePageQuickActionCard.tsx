/* eslint-disable no-return-assign */
import { QuickActionCard } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';

const HomePageQuickActionCard: React.FC = () => {
  const tabs = useActions(TabActions);
  const { t } = useTranslation();
  const quickActionDataAnalytics = [
    {
      src: '/icons/target.svg',
      alt: 'agent',
      onClick: () => history.push('/target-connect'),
      text: t('quickActionCard.connectNewAgent'),
    },
    {
      src: '/icons/teamMember.svg',
      alt: 'team',
      onClick: () => {
        history.push('/settings');
        tabs.changeSettingsTabs(1);
      },
      text: t('quickActionCard.inviteTeamMember'),
    },
    {
      src: '/icons/survey.svg',
      alt: 'survey',
      onClick: () => window.open('https://forms.gle/qMuVphRyEWCFqjD56'),
      text: t('quickActionCard.quickSurvey'),
    },
    {
      src: '/icons/docs.svg',
      alt: 'docs',
      onClick: () => window.open('https://docs.litmuschaos.io/docs/getstarted'),
      text: t('quickActionCard.readDocs'),
    },
  ];
  return (
    <QuickActionCard
      quickActions={quickActionDataAnalytics}
      title={t('quickActionCard.quickActions')}
    />
  );
};
export { HomePageQuickActionCard };
