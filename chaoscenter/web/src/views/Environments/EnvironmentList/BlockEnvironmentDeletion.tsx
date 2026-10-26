import React from 'react';
import { Button, ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';

interface BlockEnvironmentDeletionViewProps {
  environmentID: string;
  handleClose: () => void;
}

export default function BlockEnvironmentDeletionView({
  environmentID,
  handleClose
}: BlockEnvironmentDeletionViewProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Vertical padding="small" style={{ gap: '1rem', flexGrow: 1 }}>
      <Container style={{ flexGrow: 1 }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('cannotDeleteEnvironment')}</Text>
        <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'small' }}>
          {getString('cannotDeleteEnvironmentDesc', { environmentID })}
        </Text>
      </Container>
      <Layout.Horizontal style={{ gap: '0.5rem' }}>
        <Button text={getString('ok')} variation={ButtonVariation.SECONDARY} onClick={handleClose} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
