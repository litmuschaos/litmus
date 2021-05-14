import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurationBanner } from '../../../../components/ConfigurationBanner';
import useStyles from '../styles';

interface OverviewConfigureBannerProps {
  variant: '0' | '1';
}

const OverviewConfigureBanner: React.FC<OverviewConfigureBannerProps> = ({
  variant,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.banner}>
      {variant === '0' && (
        <ConfigurationBanner
          heading={t('analyticsDashboard.configureBanner.case-0.heading')}
          description={t(
            'analyticsDashboard.configureBanner.case-0.description'
          )}
          isDisabled
        />
      )}
      {variant === '1' && (
        <ConfigurationBanner
          heading={t('analyticsDashboard.configureBanner.case-1.heading')}
          description={t(
            'analyticsDashboard.configureBanner.case-1.description'
          )}
          isDisabled={false}
        />
      )}
    </div>
  );
};
export { OverviewConfigureBanner };
