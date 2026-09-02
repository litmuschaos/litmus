import { Card, Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import ThemeToggle from '@components/ThemeToggle/ThemeToggle';

export default function AccountSettingsAppearanceView(): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding={'medium'} height={'100%'} style={{ overflowY: 'auto' }}>
      <Container border={{ bottom: true }}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('appearance')}</Text>
        <Card>
          <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_700}>
              {getString('darkMode')}
            </Text>
            <ThemeToggle />
          </Layout.Horizontal>
        </Card>
      </Container>
    </Layout.Vertical>
  );
}
