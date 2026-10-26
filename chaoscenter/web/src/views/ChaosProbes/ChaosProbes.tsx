import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout } from '@harnessio/uicore';
import { isEmpty } from 'lodash-es';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import { useDocumentTitle, useRouteWithBaseUrl } from '@hooks';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import type { ChaosProbesTableProps, RefetchProbes } from '@controllers/ChaosProbes';
import NoFilteredData from '@components/NoFilteredData';
import { MemoisedChaosProbeDashboardTable } from './ChaosProbeTable';
import { AddProbeModal } from './AddProbeModal';
import NoProbes from './NoProbes';

interface ChaosProbeViewProps {
  dateRangePicker: React.ReactElement;
  probeSearchBar: React.ReactElement;
  resetFilterButton: React.ReactElement;
  probeTypeDropDown: React.ReactElement;
  areFiltersSet: boolean;
  chaosProbesTableData: ChaosProbesTableProps | undefined;
  loading: boolean;
}

function ChaosProbesView({
  refetchProbes,
  dateRangePicker,
  probeSearchBar,
  resetFilterButton,
  probeTypeDropDown,
  areFiltersSet,
  chaosProbesTableData,
  loading
}: ChaosProbeViewProps & RefetchProbes): React.ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  useDocumentTitle(getString('resilienceProbes'));

  const headerTitle = getString('resilienceProbes');

  const breadcrumbs = [
    {
      label: headerTitle,
      url: paths.toChaosProbes()
    }
  ];

  const subHeader = (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
      <Layout.Horizontal spacing="medium">
        <AddProbeModal refetchProbes={refetchProbes} />
        {probeTypeDropDown}
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="medium">
        {probeSearchBar}
        {dateRangePicker}
      </Layout.Horizontal>
    </Layout.Horizontal>
  );

  return (
    <DefaultLayoutTemplate title={headerTitle} subHeader={subHeader} breadcrumbs={breadcrumbs} loading={loading}>
      <Layout.Vertical height={'100%'} spacing={'medium'} padding={{ left: 'small', right: 'small' }}>
        {chaosProbesTableData?.content && !isEmpty(chaosProbesTableData.content) ? (
          <MemoisedChaosProbeDashboardTable {...chaosProbesTableData} refetchProbes={refetchProbes} />
        ) : areFiltersSet ? (
          <NoFilteredData resetButton={resetFilterButton} />
        ) : (
          <NoProbes height={'100%'} />
        )}
      </Layout.Vertical>
    </DefaultLayoutTemplate>
  );
}

export default withErrorBoundary(ChaosProbesView, { FallbackComponent: Fallback });
