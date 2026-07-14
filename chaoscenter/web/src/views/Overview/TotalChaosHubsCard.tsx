import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Link } from 'react-router-dom';
import { useStrings } from '@strings';
import { useRouteWithBaseUrl } from '@hooks';
import Loader from '@components/Loader';
import type { ChaosHubStatsData } from '@api/entities';
import css from './Overview.module.scss';

interface TotalChaosHubsCardProps {
  chaosHubStats: ChaosHubStatsData | undefined;
  loading: boolean;
}

export default function TotalChaosHubsCard({ chaosHubStats, loading }: TotalChaosHubsCardProps): React.ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  return (
    <div className={css.totalEnvironmentCardContainer}>
      <Loader loading={loading} small>
        <div className={css.commonCard}>
          <Layout.Horizontal flex>
            <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.GREY_600}>
              {getString('totalChaosHubs')}
            </Text>
            <Link to={paths.toChaosHubs()}>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7}>
                {getString('seeAllChaosHubs')}
              </Text>
            </Link>
          </Layout.Horizontal>
          <Text margin={{ top: 'medium' }} padding={{ bottom: 'xlarge' }} font={{ variation: FontVariation.H1 }}>
            {chaosHubStats?.totalChaosHubs ?? 0}
          </Text>
        </div>
      </Loader>
    </div>
  );
}
