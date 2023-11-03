import React from 'react';
import { Container } from '@harnessio/uicore';
import noExperiments from '@images/NoExperiments.svg';
import { useStrings } from '@strings';
import NewExperimentButton from '@components/NewExperimentButton';
import css from './NewUserLanding.module.scss';

interface NewUserLanding {
  height: string;
}

export default function NewUserLanding({ height }: NewUserLanding): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Container className={css.noExperimentsNewUser} height={height}>
      <img src={noExperiments} alt={getString('noExperiments')} />
      <p className={css.title}>{getString('newUserNoExperiments.title')}</p>
      <p className={css.subtitle}>{getString('newUserNoExperiments.subtitle')}</p>
      <NewExperimentButton />
    </Container>
  );
}
