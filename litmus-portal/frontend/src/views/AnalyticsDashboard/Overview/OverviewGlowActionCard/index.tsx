import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlowActionCard } from '../../../../components/GlowActionCard';
import { history } from '../../../../redux/configureStore';

interface GlowActionCardType {
  variant: 'dataSource' | 'dashboard';
}

const OverviewGlowCard: React.FC<GlowActionCardType> = ({ variant }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {variant === 'dataSource' && (
        <GlowActionCard
          isDisabled={false}
          data-cy="CreateWorkflowCard"
          heading={t('analyticsDashboard.glowCard.title-0')}
          info={t('analyticsDashboard.glowCard.heading-0')}
          handleClick={() => history.push('/analytics/datasource/select')}
        />
      )}
      {variant === 'dashboard' && (
        <GlowActionCard
          isDisabled={false}
          data-cy="CreateWorkflowCard"
          heading={t('analyticsDashboard.glowCard.title-1')}
          info={t('analyticsDashboard.glowCard.heading-1')}
          handleClick={() => history.push('/analytics/dashboard/select')}
        />
      )}
    </div>
  );
};
export { OverviewGlowCard };
