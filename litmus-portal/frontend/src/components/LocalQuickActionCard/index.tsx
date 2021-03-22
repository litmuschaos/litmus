/* eslint-disable no-return-assign */
import { QuickActionCard } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';

type Variant = 'homePage' | 'returningHome' | 'analytics' | 'community';
interface LocalQuickActionCardProps {
  variant?: Variant;
}
export interface QuickActionCardProps {
  onClick?: () => void;
  src: string;
  alt: string;
  text: string;
}

const LocalQuickActionCard: React.FC<LocalQuickActionCardProps> = ({
  variant,
}) => {
  const tabs = useActions(TabActions);
  const { t } = useTranslation();
  const homePage = variant === 'homePage';
  const returningHome = variant === 'returningHome';
  const analytics = variant === 'analytics';
  const community = variant === 'community';
  const emptyData: QuickActionCardProps = {
    src: '',
    alt: '',
    text: '',
  };
  const quickActionData: Array<QuickActionCardProps> = [
    analytics
      ? {
          src: './icons/addDashboard.svg',
          alt: 'dashboard',
          onClick: () => history.push('/analytics/dashboard/select'),
          text: t('quickActionCard.addDashboard'),
        }
      : emptyData,
    analytics
      ? {
          src: './icons/addDataSource.svg',
          alt: 'data source',
          onClick: () => history.push('/analytics/datasource/select'),
          text: t('quickActionCard.addDataSource'),
        }
      : emptyData,
    returningHome || analytics
      ? {
          src: '/icons/calendarWorkflowIcon.svg',
          alt: 'workflow',
          onClick: () => history.push('/create-workflow'),
          text: t('quickActionCard.scheduleWorkflow'),
        }
      : emptyData,
    homePage || returningHome || analytics
      ? {
          src: '/icons/target.svg',
          alt: 'agent',
          onClick: () => history.push('/target-connect'),
          text: t('quickActionCard.connectNewAgent'),
        }
      : emptyData,
    homePage || returningHome || community || analytics
      ? {
          src: '/icons/teamMember.svg',
          alt: 'team',
          onClick: () => {
            history.push('/settings');
            tabs.changeSettingsTabs(1);
          },
          text: t('quickActionCard.inviteTeamMember'),
        }
      : emptyData,
    homePage || community
      ? {
          src: '/icons/survey.svg',
          alt: 'survey',
          onClick: () => window.open('https://forms.gle/qMuVphRyEWCFqjD56'),
          text: t('quickActionCard.quickSurvey'),
        }
      : emptyData,
    homePage || community || analytics
      ? {
          src: '/icons/docs.svg',
          alt: 'docs',
          onClick: () =>
            window.open('https://docs.litmuschaos.io/docs/getstarted'),
          text: t('quickActionCard.readDocs'),
        }
      : emptyData,
    community
      ? {
          src: './icons/docs.svg',
          alt: 'docs',
          onClick: () =>
            window.open(
              'https://docs.litmus.com/docs/litmus-api-documentation'
            ),
          text: t('quickActionCard.readAPIDocs'),
        }
      : emptyData,
  ].filter((el) => {
    return el.src.length > 0;
  });

  return (
    <QuickActionCard
      quickActions={quickActionData}
      title={t('quickActionCard.quickActions')}
    />
  );
};
export { LocalQuickActionCard };
