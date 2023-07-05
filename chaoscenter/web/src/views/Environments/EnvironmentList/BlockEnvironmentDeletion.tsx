import React from 'react';
import { Button, ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';

interface BlockEnvironmentDeletionViewProps {
  environmentID: string;
  handleClose: () => void;
}

export default function BlockEnvironmentDeletionView({
  environmentID,
  handleClose
}: BlockEnvironmentDeletionViewProps): React.ReactElement {
  return (
    <Layout.Vertical padding="small" style={{ gap: '1rem', flexGrow: 1 }}>
      <Container style={{ flexGrow: 1 }}>
        <Text font={{ variation: FontVariation.H4 }}>Cannot Delete Environment</Text>
        <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'small' }}>
          The delete operation could not be completed as {environmentID} is being referred to by other chaos
          infrastructures, please delete them first before deleting the environment.
        </Text>
      </Container>
      <Layout.Horizontal style={{ gap: '0.5rem' }}>
        <Button text={'OK'} variation={ButtonVariation.SECONDARY} onClick={handleClose} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
