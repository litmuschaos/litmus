import React from 'react';
import { Container, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import Loader from '@components/Loader';
import type { ExperimentStatsData } from '@api/entities';
import css from './Overview.module.scss';

interface TotalExperimentCardProps {
  experimentStats: ExperimentStatsData | undefined;
  loading: boolean;
}

export default function TotalExperimentCard({
  experimentStats,
  loading
}: TotalExperimentCardProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <div className={css.totalExperimentCardContainer}>
      <Loader loading={loading} small>
        <div className={css.commonCard}>
          <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.GREY_600}>
            {getString('totalExp')}
          </Text>
          <Container>
            <Text font={{ variation: FontVariation.H1 }} margin={{ bottom: 'xlarge' }}>
              {experimentStats?.totalExperiments ?? 0}
            </Text>
          </Container>
        </div>
      </Loader>
    </div>
  );
}
