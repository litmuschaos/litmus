import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Fallback } from '@errors';
import type { Mode, Probe } from '@api/entities';
import { useStrings } from '@strings';
import ProbeInformationCardFromAPI, {
  ProbeInformationType
} from '@components/ProbeInformationCard/ProbeInformationCardFromAPI';

interface ProbeDescriptionProps {
  probeDetail: Probe;
  mode?: Mode;
}

function ProbeDescription({ probeDetail, mode }: ProbeDescriptionProps): React.ReactElement {
  const { getString } = useStrings();
  function getOverviewProperties(): string[][] {
    const overviewData: string[][] = [];

    const description = probeDetail.description === '' ? getString('noDescriptionProvided') : probeDetail.description;

    overviewData.push(['Description', description ?? '']);
    overviewData.push(['Probe Type', probeDetail.type]);
    overviewData.push(['Probe Mode', mode ?? getString('toBeDefined')]);

    return overviewData;
  }

  return (
    <Layout.Vertical height={'60vh'} spacing={'medium'} padding={{ left: 'medium', right: 'medium' }}>
      <Text
        font={{ variation: FontVariation.SMALL_BOLD }}
        color={Color.BLACK}
        padding={{ top: 'large', left: 'large', right: 'large' }}
      >
        {getString('overview')}
      </Text>
      <Layout.Vertical spacing={'medium'} border={{ top: true, color: Color.GREY_200 }}>
        {getOverviewProperties().map(value => (
          <Layout.Horizontal key={value[0]} margin={'large'}>
            <Layout.Horizontal spacing={'medium'} width={140}>
              <Text font={{ variation: FontVariation.TINY, weight: 'semi-bold' }} color={Color.BLACK}>
                {value[0]}:
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing={'medium'} width={140}>
              <Text font={{ variation: FontVariation.TINY, weight: 'light' }} color={Color.GREY_800} lineClamp={1}>
                {value[1]}
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        ))}
      </Layout.Vertical>

      <ProbeInformationCardFromAPI
        display={ProbeInformationType.PROPERTIES}
        hideTopBorder
        probe={probeDetail}
        inStudio
        isVerbose
      />

      <ProbeInformationCardFromAPI
        display={ProbeInformationType.DETAILS}
        hideTopBorder
        probe={probeDetail}
        inStudio
        isVerbose
      />
    </Layout.Vertical>
  );
}

export default withErrorBoundary(ProbeDescription, { FallbackComponent: Fallback });
