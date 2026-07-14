import { Text, Layout } from '@harnessio/uicore';
import { FontVariation, Color } from '@harnessio/design-system';
import React from 'react';
import { Icon } from '@harnessio/icons';
import { ProbeType } from '@api/entities';
import type { StringsMap } from 'strings/types';
import { getIcon } from '@utils';

// Render the type of the probe and the description of the type at the top of Probe Configuration UI
export function probeTypeRenderer(
  type: ProbeType,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): React.ReactElement | undefined {
  switch (type) {
    case ProbeType.HTTP:
      return (
        <>
          <Layout.Horizontal spacing={'small'} padding={{ top: 'medium', bottom: 'medium' }}>
            <Icon name={getIcon(ProbeType.HTTP)} size={25} />
            <Text font={{ variation: FontVariation.BODY1, weight: 'bold' }}>{getString('probeTypes.httpProbe')}</Text>
          </Layout.Horizontal>
          <Text
            font={{ variation: FontVariation.BODY, weight: 'light' }}
            margin={{ bottom: 'large' }}
            color={Color.GREY_600}
          >
            {getString('httpProbeDetails')}
          </Text>
        </>
      );
    case ProbeType.CMD:
      return (
        <>
          <Layout.Horizontal spacing={'small'} padding={{ top: 'medium', bottom: 'medium' }}>
            <Icon name={getIcon(ProbeType.CMD)} size={25} />
            <Text font={{ variation: FontVariation.BODY1, weight: 'bold' }}>{getString('probeTypes.cmdProbe')}</Text>
          </Layout.Horizontal>
          <Text
            font={{ variation: FontVariation.BODY, weight: 'light' }}
            margin={{ bottom: 'large' }}
            color={Color.GREY_600}
          >
            {getString('cmdProbeDetails')}
          </Text>
        </>
      );
    case ProbeType.PROM:
      return (
        <>
          <Layout.Horizontal spacing={'small'} padding={{ top: 'medium', bottom: 'medium' }}>
            <Icon name={getIcon(ProbeType.PROM)} size={25} />
            <Text font={{ variation: FontVariation.BODY1, weight: 'bold' }}>{getString('probeTypes.promProbe')}</Text>
          </Layout.Horizontal>
          <Text
            font={{ variation: FontVariation.BODY, weight: 'light' }}
            margin={{ bottom: 'large' }}
            color={Color.GREY_600}
          >
            {getString('promProbeDetails')}
          </Text>
        </>
      );
    case ProbeType.K8S:
      return (
        <>
          <Layout.Horizontal spacing={'small'} padding={{ top: 'medium', bottom: 'medium' }}>
            <Icon name={getIcon(ProbeType.K8S)} size={25} />
            <Text font={{ variation: FontVariation.BODY1, weight: 'bold' }}>{getString('probeTypes.k8sProbe')}</Text>
          </Layout.Horizontal>
          <Text
            font={{ variation: FontVariation.BODY, weight: 'light' }}
            margin={{ bottom: 'large' }}
            color={Color.GREY_600}
          >
            {getString('k8sProbeDetails')}
          </Text>
        </>
      );
  }
}
