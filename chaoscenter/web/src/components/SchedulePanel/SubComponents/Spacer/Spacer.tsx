import React from 'react';
import { Container } from '@harnessio/uicore';
import css from './Spacer.module.scss';

interface SpacerInterface {
  paddingTop?: string;
  paddingBottom?: string;
  width?: string;
  marginLeft?: string;
}

export default function Spacer(props: SpacerInterface): JSX.Element {
  const { paddingTop, paddingBottom, marginLeft, width } = props;
  return (
    <Container
      style={{
        paddingTop: `${paddingTop ? paddingTop : '0'}`,
        paddingBottom: `${paddingBottom ? paddingBottom : '0'}`,
        marginLeft: `${marginLeft ? marginLeft : '0'}`,
        width: `${width ? width : '100%'}`
      }}
      className={css.spacer}
    >
      <Container />
    </Container>
  );
}
