import React from 'react';
import { Container } from '@harnessio/uicore';
import noExperiments from '@images/NoExperiments.svg';
import { useStrings } from '@strings';
import css from './ChaosProbes.module.scss';

interface NoProbesProps {
  height: string;
}

export default function NoProbes({ height }: NoProbesProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Container className={css.noProbes} height={height}>
      <img src={noExperiments} alt={getString('noProbes')} />
      <p className={css.title}>{getString('noProbesFound.title')}</p>
      <p className={css.subtitle}>{getString('noProbeExecutionDetails.subtitle')}</p>
    </Container>
  );
}
