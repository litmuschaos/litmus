import React from 'react';
import { Button, ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { withErrorBoundary } from 'react-error-boundary';
import Loader from '@components/Loader';
import { InfrastructureType, Probe, ProbeType } from '@api/entities';
import { useStrings } from '@strings';
import { Fallback } from '@errors';
import { useSearchParams } from '@hooks';
import YAMLBuilder from '@components/YAMLBuilder';
import ProbeProperties from './ProbeProperties/ProbeProperties';
import { probeTypeRenderer } from './ChaosProbeType';
import HTTPProbeDetails from './ProbeProperties/HTTP/HTTPProbeDetails';
import PROMProbeDetails from './ProbeProperties/PROM/PROMProbeDetails';
import K8SProbeDetails from './ProbeProperties/K8S/K8SProbeDetails';
import CMDProbeDetails from './ProbeProperties/CMD/CMDProbeDetails';
import css from './ChaosProbeConfiguration.module.scss';

interface ChaosProbeConfigurationViewProps {
  loading: boolean;
  probeData: Probe | undefined;
  probeYAML?: string;
  probeYAMLLoading?: boolean;
}

type ViewMode = 'visual' | 'yaml';

function ChaosProbeConfigurationView({
  loading,
  probeData,
  probeYAML,
  probeYAMLLoading
}: ChaosProbeConfigurationViewProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  const [viewMode, setViewMode] = React.useState<ViewMode>('visual');

  function getProbeProperties(type: ProbeType): React.ReactElement | undefined {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      switch (type) {
        case ProbeType.HTTP:
          return <ProbeProperties kubernetesHTTPProperties={probeData?.kubernetesHTTPProperties} />;
        case ProbeType.CMD:
          return <ProbeProperties kubernetesCMDProperties={probeData?.kubernetesCMDProperties} />;
        case ProbeType.PROM:
          return <ProbeProperties promProperties={probeData?.promProperties} />;
        case ProbeType.K8S:
          return <ProbeProperties k8sProperties={probeData?.k8sProperties} />;
      }
    }
  }

  function getProbeDetails(type: ProbeType): React.ReactElement | undefined {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      switch (type) {
        case ProbeType.HTTP:
          return <HTTPProbeDetails kubernetesHTTPProperties={probeData?.kubernetesHTTPProperties} />;
        case ProbeType.CMD:
          return <CMDProbeDetails kubernetesCMDProperties={probeData?.kubernetesCMDProperties} />;
        case ProbeType.PROM:
          return <PROMProbeDetails promProperties={probeData?.promProperties} />;
        case ProbeType.K8S:
          return <K8SProbeDetails k8sProperties={probeData?.k8sProperties} />;
      }
    }
  }

  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{
        minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xxlarge))' : 'initial'
      }}
    >
      {/* View mode toggle */}
      <Layout.Horizontal spacing="small" padding={{ left: 'large', top: 'medium', bottom: 'xsmall' }}>
        <Button
          variation={viewMode === 'visual' ? ButtonVariation.SECONDARY : ButtonVariation.TERTIARY}
          text={getString('probeVisualView')}
          onClick={() => setViewMode('visual')}
          className={viewMode === 'visual' ? css.activeTab : css.tab}
        />
        <Button
          variation={viewMode === 'yaml' ? ButtonVariation.SECONDARY : ButtonVariation.TERTIARY}
          text={getString('probeYAMLView')}
          onClick={() => setViewMode('yaml')}
          className={viewMode === 'yaml' ? css.activeTab : css.tab}
        />
      </Layout.Horizontal>

      {/* YAML view */}
      {viewMode === 'yaml' && (
        <Loader loading={probeYAMLLoading ?? false} height="fit-content">
          <Container padding={{ left: 'large', right: 'large', bottom: 'large' }}>
            <YAMLBuilder
              fileName={`${probeData?.name ?? 'probe'}.yml`}
              existingYaml={probeYAML}
              height="calc(100vh - 220px)"
              width="100%"
              isReadOnlyMode={true}
              isEditModeSupported={false}
            />
          </Container>
        </Loader>
      )}

      {/* Visual view */}
      {viewMode === 'visual' && (
        <Layout.Horizontal spacing={'medium'} padding={'large'}>
          <Layout.Vertical width={'80%'}>
            <Container
              border={{ radius: 5 }}
              margin={{ bottom: 'xlarge' }}
              className={css.card}
              background={Color.WHITE}
            >
              <Text
                font={{ variation: FontVariation.H6 }}
                padding={{ top: 'medium', bottom: 'medium' }}
                className={css.tablePadding}
                border={{ bottom: true }}
              >
                {getString('probeOverview')}
              </Text>
              <Container className={css.tablePadding}>
                <Text font={{ variation: FontVariation.LEAD, weight: 'semi-bold' }} margin={{ top: 'large' }}>
                  {getString('probeType')}
                </Text>
                {probeData && probeTypeRenderer(probeData.type, getString)}
              </Container>
            </Container>

            <Container
              border={{ radius: 5 }}
              margin={{ top: 'xlarge', bottom: 'xlarge' }}
              className={css.card}
              background={Color.WHITE}
            >
              <Text
                font={{ variation: FontVariation.H6 }}
                padding={{ top: 'medium', bottom: 'medium' }}
                className={css.tablePadding}
                border={{ bottom: true }}
              >
                {getString('probeProperties')}
              </Text>
              {probeData && getProbeProperties(probeData.type)}
            </Container>

            <Container
              border={{ radius: 5 }}
              margin={{ top: 'xlarge', bottom: 'xlarge' }}
              className={css.card}
              background={Color.WHITE}
            >
              <Text
                font={{ variation: FontVariation.H6 }}
                padding={{ top: 'medium', bottom: 'medium' }}
                className={css.tablePadding}
                border={{ bottom: true }}
              >
                {getString('probeDetails')}
              </Text>
              {probeData && getProbeDetails(probeData.type)}
            </Container>
          </Layout.Vertical>

          <Layout.Vertical width={'20%'} padding={{ top: 'large', left: 'large' }}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600} margin={{ bottom: 'small' }}>
              {getString('onThisPage')}
            </Text>
            <Container border={{ left: true }} width={'100%'}>
              <Text
                font={{ variation: FontVariation.BODY, weight: 'light' }}
                padding={{ left: 'large', top: 'small', bottom: 'small' }}
                color={Color.GREY_400}
              >
                {getString('probeOverview')}
              </Text>
            </Container>
            <Container border={{ left: true }} width={'100%'}>
              <Text
                font={{ variation: FontVariation.BODY, weight: 'light' }}
                padding={{ left: 'large', top: 'small', bottom: 'small' }}
                color={Color.GREY_400}
              >
                {getString('probeProperties')}
              </Text>
            </Container>
            <Container border={{ left: true }} width={'100%'}>
              <Text
                font={{ variation: FontVariation.BODY, weight: 'light' }}
                padding={{ left: 'large', top: 'small', bottom: 'small' }}
                color={Color.GREY_400}
              >
                {getString('probeDetails')}
              </Text>
            </Container>
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Loader>
  );
}

export default withErrorBoundary(ChaosProbeConfigurationView, { FallbackComponent: Fallback });
