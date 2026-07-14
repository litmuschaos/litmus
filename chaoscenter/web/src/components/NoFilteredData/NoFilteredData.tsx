import React from 'react';
import { Container } from '@harnessio/uicore';
import noFilteredData from '@images/noFilteredData.svg';
import { useStrings } from '@strings';
import css from './NoFilteredData.module.scss';

interface NoFilteredDataProps {
  height?: string;
  resetButton?: React.ReactElement;
}

export default function NoFilteredData({ height, resetButton }: NoFilteredDataProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Container className={css.noFilteredData} height={height ?? '100%'}>
      <img src={noFilteredData} alt="No Filtered Data" />
      <p className={css.title}>{getString('noFilteredData.title')}</p>
      <p className={css.subtitle}>{getString('noFilteredData.subtitle')}</p>
      {resetButton}
    </Container>
  );
}
