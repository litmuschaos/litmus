/* eslint-disable no-return-assign */
import { QuickActionCard, QuickActionCardProps } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { constants } from '../../constants';
import { Role } from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';

type Variant = 'homePage' | 'returningHome' | 'observability' | 'community';

interface LocalQuickActionCardProps {
  variant?: Variant;
  className?: string;
}

const LocalQuickActionCard: React.FC<LocalQuickActionCardProps> = ({
  variant,
  className,
}) => {
  const tabs = useActions(TabActions);
  const { t } = useTranslation();
  const projectID = getProjectID();
  const userRole = getProjectRole();
  const homePage = variant === 'homePage';
  const returningHome = variant === 'returningHome';
  const observability = variant === 'observability';
  const community = variant === 'community';
  const emptyData: QuickActionCardProps = {
    src: '',
    alt: '',
    text: '',
  };
  const quickActionData: Array<QuickActionCardProps> = [
    observability
      ? {
          src: './icons/addDataSource.svg',
          alt: 'data source',
          onClick: () =>
            history.push({
              pathname: '/analytics/datasource/select',
              search: `?projectID=${projectID}&projectRole=${userRole}`,
            }),
          text: t('quickActionCard.addDataSource'),
        }
      : emptyData,
    returningHome
      ? {
          src: './icons/calendarWorkflowIcon.svg',
          alt: 'Chaos Scenario',
          onClick: () =>
            history.push({
              pathname: '/create-scenario',
              search: `?projectID=${projectID}&projectRole=${userRole}`,
            }),
          text: t('quickActionCard.scheduleWorkflow'),
        }
      : emptyData,
    homePage || returningHome || observability
      ? {
          src: './icons/target.svg',
          alt: 'delegate',
          onClick: () =>
            history.push({
              pathname: '/target-connect',
              search: `?projectID=${projectID}&projectRole=${userRole}`,
            }),
          text: t('quickActionCard.connectNewAgent'),
        }
      : emptyData,

    // TODO: settings only accessible by Owner
    (homePage || returningHome || community || observability) &&
    getProjectRole() === Role.OWNER
      ? {
          src: './icons/teamMember.svg',
          alt: 'team',
          onClick: () => {
            tabs.changeSettingsTabs(1);
            history.push({
              pathname: '/settings',
              search: `?projectID=${projectID}&projectRole=${userRole}`,
            });
          },
          text: t('quickActionCard.inviteTeamMember'),
        }
      : emptyData,
    homePage || community
      ? {
          src: './icons/survey.svg',
          alt: 'survey',
          onClick: () => window.open(constants.FeedbackForm),
          text: t('quickActionCard.quickSurvey'),
        }
      : emptyData,
    homePage || community || observability
      ? {
          src: './icons/docs.svg',
          alt: 'docs',
          onClick: () => window.open('https://docs.litmuschaos.io/'),
          text: t('quickActionCard.readDocs'),
        }
      : emptyData,
    community
      ? {
          src: './icons/docs.svg',
          alt: 'api-docs',
          onClick: () => window.open('/api-docs/index.html'),
          text: t('quickActionCard.readAPIDocs'),
        }
      : emptyData,
  ].filter((el) => {
    return el.src.length > 0;
  });

  return (
    <QuickActionCard
      className={className}
      quickActions={quickActionData}
      title={t('quickActionCard.quickActions')}
    />
  );
};
export { LocalQuickActionCard };
