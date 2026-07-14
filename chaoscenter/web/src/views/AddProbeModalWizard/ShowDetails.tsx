import React from 'react';
import { Icon } from '@harnessio/icons';
import { Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { ProbeType } from '@api/entities';
import type { StringsMap } from 'strings/types';
import { getIcon } from '@utils';

export function showDetails(
  type: ProbeType,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): React.ReactElement | undefined {
  switch (type) {
    case ProbeType.HTTP:
      return (
        <div>
          <Icon name={getIcon(ProbeType.HTTP)} size={50} />
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.WHITE}>
            {getString(`httpProbeTitle`)}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.GREY_200}>
            {getString(`httpProbeDetails`)}
          </Text>
        </div>
      );
    case ProbeType.CMD:
      return (
        <div>
          <Icon name={getIcon(ProbeType.CMD)} size={50} />
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.WHITE}>
            {getString(`cmdProbeTitle`)}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.GREY_200}>
            {getString(`cmdProbeDetails`)}
          </Text>
        </div>
      );
    case ProbeType.PROM:
      return (
        <div>
          <Icon name={getIcon(ProbeType.PROM)} size={50} />
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.WHITE}>
            {getString(`promProbeTitle`)}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.GREY_200}>
            {getString(`promProbeDetails`)}
          </Text>
        </div>
      );
    case ProbeType.K8S:
      return (
        <div>
          <Icon name={getIcon(ProbeType.K8S)} size={50} />
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.WHITE}>
            {getString(`k8sProbeTitle`)}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }} padding={{ top: 'small' }} color={Color.GREY_200}>
            {getString(`k8sProbeDetails`)}
          </Text>
        </div>
      );
  }
}
