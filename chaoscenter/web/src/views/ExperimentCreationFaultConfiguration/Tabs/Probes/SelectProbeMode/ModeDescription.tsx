import { Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import React from 'react';

interface ModeDescriptionProps {
  mode: string;
  description: string;
}

function ModeDescription({ mode, description }: ModeDescriptionProps): React.ReactElement {
  return (
    <Layout.Vertical>
      <Text
        font={{ variation: FontVariation.BODY2, weight: 'bold' }}
        margin={{ bottom: 'large' }}
        lineClamp={1}
        icon="play-circle"
      >
        {mode}
      </Text>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ bottom: 'xxlarge' }}>
        {description}
      </Text>
    </Layout.Vertical>
  );
}

export default ModeDescription;
