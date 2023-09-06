import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { Container, Layout, Page, Tabs } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import { useSearchParams, useUpdateSearchParams, useRouteWithBaseUrl } from '@hooks';
import type { Probe } from '@api/entities';
import Loader from '@components/Loader';
import ChaosProbeConfigurationController from '@controllers/ChaosProbeConfiguration';
import ChaosProbeExecutionHistoryController from '@controllers/ChaosProbeExecutionHistory';
import { ProbeTabs } from '@models';
import ChaosProbeHeader from './ChaosProbeHeader';
import css from './ChaosProbe.module.scss';

interface ChaosProbeViewProps {
  loading: boolean;
  probeData: Probe | undefined;
}

function ChaosProbeView({ loading, probeData }: ChaosProbeViewProps): React.ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const { probeName } = useParams<{ probeName: string }>();
  const selectedTabId = searchParams.get('tab') as ProbeTabs;

  const breadcrumbs = [
    {
      label: getString('resilienceProbes'),
      url: paths.toChaosProbes()
    },
    {
      label: probeName ?? '',
      url: paths.toChaosProbe({ probeName: probeName })
    }
  ];

  const handleTabChange = (tabID: ProbeTabs): void => {
    switch (tabID) {
      case ProbeTabs.EXECUTION_RESULTS:
        updateSearchParams({ tab: ProbeTabs.EXECUTION_RESULTS });
        break;
      case ProbeTabs.CONFIGURATION:
        updateSearchParams({ tab: ProbeTabs.CONFIGURATION });
        break;
    }
  };

  const subHeader = (
    <Tabs
      id={'chaosProbeTabs'}
      defaultSelectedTabId={selectedTabId}
      onChange={handleTabChange}
      tabList={[
        {
          id: ProbeTabs.EXECUTION_RESULTS,
          title: getString('executionHistory')
        },
        {
          id: ProbeTabs.CONFIGURATION,
          title: getString('probeConfiguration')
        }
      ]}
    />
  );

  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{ minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xlarge))' : 'initial' }}
    >
      {probeData && (
        <ChaosProbeHeader
          title={probeData.name}
          breadcrumbs={breadcrumbs}
          probeData={{
            name: probeName,
            type: probeData.type,
            description: probeData.description ?? ''
          }}
          createdAt={probeData.createdAt ?? ''}
          updatedAt={probeData.updatedAt ?? ''}
        >
          <Layout.Vertical width={'100%'} background={Color.PRIMARY_BG} height="calc(100vh - 80px)">
            <Page.SubHeader className={css.subHeader}>{subHeader}</Page.SubHeader>
            <Container width="100%" border={{ top: true }}>
              {selectedTabId === ProbeTabs.EXECUTION_RESULTS ? (
                <ChaosProbeExecutionHistoryController />
              ) : (
                <ChaosProbeConfigurationController type={probeData.type} />
              )}
            </Container>
          </Layout.Vertical>
        </ChaosProbeHeader>
      )}
    </Loader>
  );
}

export default withErrorBoundary(ChaosProbeView, { FallbackComponent: Fallback });
