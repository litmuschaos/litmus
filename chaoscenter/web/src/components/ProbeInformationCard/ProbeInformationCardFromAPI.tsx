import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { getProbeDetailsFromParsedProbe, getProbePropertiesFromParsedProbe } from '@utils';
import type { Probe } from '@api/entities';

export enum ProbeInformationType {
  DETAILS = 'DETAILS',
  PROPERTIES = 'PROPERTIES'
}

const ProbeInformationCardFromAPI = ({
  probe,
  isVerbose = true,
  hideTopBorder = false,
  display,
  inStudio,
  inProbeSelectMode
}: {
  probe: Probe;
  isVerbose?: boolean;
  hideTopBorder?: boolean;
  display: ProbeInformationType;
  inProbeSelectMode?: boolean;
  inStudio?: boolean;
}): JSX.Element => {
  const { getString } = useStrings();

  /**
   * Will remove deeply nested __typename fields efficiently from the payload
   * Apollo Github Issue: https://github.com/apollographql/apollo-feature-requests/issues/6
   * */
  const probeData: Probe = JSON.parse(
    JSON.stringify(probe, (name, val) => {
      if (name === '__typename') {
        delete val[name];
      } else if (val === null) {
        return undefined;
      } else {
        return val;
      }
    })
  );
  const displayData =
    display === ProbeInformationType.PROPERTIES
      ? getProbePropertiesFromParsedProbe(probe)
      : getProbeDetailsFromParsedProbe(probeData);
  return (
    <Layout.Vertical>
      {isVerbose && (
        <Text
          font={{ variation: inStudio ? FontVariation.SMALL_BOLD : FontVariation.H4 }}
          color={inProbeSelectMode ? Color.BLACK : Color.WHITE}
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
                font={{ variation: inStudio ? FontVariation.TINY : FontVariation.BODY2, weight: 'semi-bold' }}
                color={
                  inStudio
                    ? inProbeSelectMode
                      ? Color.GREY_800
                      : Color.WHITE
                    : !inStudio && isVerbose
                    ? Color.GREY_200
                    : Color.GREY_500
                }
              >
                {value[0]}:
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing={'medium'} width={isVerbose ? 140 : 200}>
              <Text
                font={{ variation: inStudio ? FontVariation.TINY : FontVariation.BODY2, weight: 'light' }}
                color={
                  inStudio
                    ? inProbeSelectMode
                      ? Color.GREY_800
                      : Color.WHITE
                    : !inStudio && isVerbose
                    ? Color.GREY_200
                    : Color.GREY_500
                }
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

export default ProbeInformationCardFromAPI;
