import React from 'react';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { withErrorBoundary } from 'react-error-boundary';
import Loader from '@components/Loader';
import { InfrastructureType, Probe, ProbeType } from '@api/entities';
import { useStrings } from '@strings';
import { Fallback } from '@errors';
import { useSearchParams } from '@hooks';
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
}

function ChaosProbeConfigurationView({ loading, probeData }: ChaosProbeConfigurationViewProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;

  // Returns the probe properties of the selected type
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
  // Returns the probe details of the selected type
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
      <Layout.Horizontal spacing={'medium'} padding={'large'}>
        {/* 80% of the screen from the left reserved for Probe details tables */}
        <Layout.Vertical width={'80%'}>
          {/* Probe Overview */}
          <Container border={{ radius: 5 }} margin={{ bottom: 'xlarge' }} className={css.card} background={Color.WHITE}>
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

          {/* Run Properties */}
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

          {/* Probe Details */}
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

        {/* 20% of the screen from the right reserved for content on the page */}
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
    </Loader>
  );
}

export default withErrorBoundary(ChaosProbeConfigurationView, { FallbackComponent: Fallback });
