import React from 'react';
import { Container, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import noExperiments from '@images/NoExperiments.svg';
import { useStrings } from '@strings';
import NewExperimentButton from '@components/NewExperimentButton';
import css from './ChaosProbeExecutionHistory.module.scss';

interface NoProbeExecutionProps {
  height: string;
}

export default function NoProbeExecution({ height }: NoProbeExecutionProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Container className={css.noProbeExecution} height={height}>
      <img src={noExperiments} alt={getString('noProbeExecution')} />
      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500} lineClamp={1} className={css.title}>
        {getString('noProbeExecutionDetails.title')}
      </Text>
      <Text
        font={{ variation: FontVariation.SMALL_SEMI }}
        color={Color.GREY_500}
        lineClamp={1}
        className={css.subtitle}
      >
        {getString('noProbeExecutionDetails.subtitle')}
      </Text>
      <NewExperimentButton />
    </Container>
  );
}
