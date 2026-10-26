import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import type { ProbeAttributes } from '@models';
import { useStrings } from '@strings';
import { getProbeDetails, getProbeProperties } from '@utils';

export enum ProbeInformationType {
  DETAILS = 'DETAILS',
  PROPERTIES = 'PROPERTIES'
}

const ProbeInformationCard = ({
  probe,
  isVerbose = true,
  hideTopBorder = false,
  display
}: {
  probe: ProbeAttributes;
  isVerbose?: boolean;
  hideTopBorder?: boolean;
  display: ProbeInformationType;
}): JSX.Element => {
  const { getString } = useStrings();
  const displayData = display === ProbeInformationType.PROPERTIES ? getProbeProperties(probe) : getProbeDetails(probe);
  return (
    <Layout.Vertical>
      {isVerbose && (
        <Text
          font={{ variation: FontVariation.H4, weight: 'bold' }}
          color={Color.WHITE}
          padding={{ top: 'large', left: 'large', right: 'large' }}
        >
          {display === ProbeInformationType.PROPERTIES ? getString('probeProperties') : getString('probeDetails')}
        </Text>
      )}
      <Layout.Vertical
        spacing={'medium'}
        border={(!hideTopBorder || isVerbose) && { top: true, color: Color.GREY_200 }}
      >
        {displayData.map(value => (
          <Layout.Horizontal key={value[0]} margin={'large'}>
            <Layout.Horizontal spacing={'medium'} width={isVerbose ? 140 : 200}>
              <Text
                font={{ variation: FontVariation.BODY2, weight: 'semi-bold' }}
                color={isVerbose ? Color.GREY_200 : Color.GREY_500}
              >
                {value[0]}:
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing={'medium'} width={isVerbose ? 140 : 200}>
              <Text
                font={{ variation: FontVariation.BODY2, weight: 'semi-bold' }}
                color={isVerbose ? Color.GREY_200 : Color.GREY_500}
                lineClamp={1}
              >
                {value[1]}
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        ))}
      </Layout.Vertical>
    </Layout.Vertical>
  );
};

export default ProbeInformationCard;
