import { Card, Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { ThemeSegmentedControl } from '@components/ThemeToggle/ThemeSegmentedControl';

export const AccountSettingsAppearanceView = (): React.ReactElement => {
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding={'medium'} height={'100%'} style={{ overflowY: 'auto' }}>
      <Container border={{ bottom: true }}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('appearance')}</Text>
        <Card>
          <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemeSegmentedControl />
          </Layout.Horizontal>
        </Card>
      </Container>
    </Layout.Vertical>
  );
};
