import React from 'react';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { withErrorBoundary } from 'react-error-boundary';
import { useStrings } from '@strings';
import { Fallback } from '@errors';
import type { ExperimentManifest } from '@models';
import Loader from '@components/Loader';
import experimentYamlService from 'services/experiment';
import { GetFaultTunablesOperation } from '@services/experiment/ExperimentYamlService';
import { InfrastructureType } from '@api/entities';
import css from '../ExperimentRunDetailsPanel.module.scss';

interface FaultConfigurationTabProps {
  loading?: boolean;
  manifest?: string;
  nodeName: string;
}

//TODO: update when support for secretRef and configMapRef comes
const DataRow = ({ label, value }: { label: string; value: string | number | boolean }): React.ReactElement => {
  return (
    <Layout.Horizontal margin={{ top: 'small', bottom: 'medium' }}>
      <Layout.Horizontal spacing={'medium'} width={200}>
        <Text font={{ variation: FontVariation.FORM_LABEL }} color={Color.GREY_500} lineClamp={1}>
          {`${label}:`}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing={'medium'} width={200}>
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800} lineClamp={1}>
          {value}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  );
};

function FaultConfigurationTab({ loading, manifest, nodeName }: FaultConfigurationTabProps): React.ReactElement {
  const { getString } = useStrings();
  const parsedManifest = manifest ? (JSON.parse(manifest) as ExperimentManifest) : undefined;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const faultData = experimentHandler?.getFaultData(parsedManifest, nodeName);
  const faultTunables = React.useMemo(
    () => experimentHandler?.getFaultTunables(faultData, GetFaultTunablesOperation.UpdatedEnvs),
    [experimentHandler, faultData]
  );

  return (
    <Container padding="medium">
      <Loader loading={loading} small>
        {faultData === undefined ? (
          <Container className={css.probeTab} margin={{ top: 'small' }}>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {getString('noData.title')}
            </Text>
          </Container>
        ) : (
          <>
            {faultData.engineCR?.spec?.appinfo && (
              <Layout.Vertical className={css.probeTab} spacing={'small'}>
                <Text
                  font={{ variation: FontVariation.UPPERCASED, weight: 'semi-bold' }}
                  margin={{ top: 'small', bottom: 'medium' }}
                >
                  {getString('targetApplication')}
                </Text>
                <Layout.Vertical margin={{ left: 'small', bottom: 'small' }}>
                  <DataRow label={getString('appNameSpace')} value={faultData.engineCR.spec.appinfo.appns ?? ''} />
                  <DataRow label={getString('appKind')} value={faultData.engineCR.spec.appinfo.appkind ?? ''} />
                  <DataRow label={getString('appLabel')} value={faultData.engineCR.spec.appinfo.applabel ?? ''} />
                </Layout.Vertical>
              </Layout.Vertical>
            )}
            <Layout.Vertical
              className={css.probeTab}
              spacing={'small'}
              border={faultData.engineCR?.spec?.appinfo ? { top: true, color: Color.GREY_200 } : false}
            >
              <Text
                font={{ variation: FontVariation.UPPERCASED, weight: 'semi-bold' }}
                margin={{ top: faultData.engineCR?.spec?.appinfo ? 'medium' : 'small', bottom: 'medium' }}
              >
                {getString('tuneFault')}
              </Text>
              <Layout.Vertical margin={{ left: 'small', bottom: 'small' }}>
                {faultTunables &&
                  Object.entries(faultTunables).map(([key, value]) => {
                    if (value.value) return <DataRow key={key} label={key.toLowerCase()} value={value.value} />;
                  })}
              </Layout.Vertical>
            </Layout.Vertical>
          </>
        )}
      </Loader>
    </Container>
  );
}

export default withErrorBoundary(FaultConfigurationTab, { FallbackComponent: Fallback });
