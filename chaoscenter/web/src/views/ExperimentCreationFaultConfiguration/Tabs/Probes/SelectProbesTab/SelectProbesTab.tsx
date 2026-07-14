import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout } from '@harnessio/uicore';
import { isEmpty } from 'lodash-es';
import type { ApolloQueryResult } from '@apollo/client';
import { Fallback } from '@errors';
import Loader from '@components/Loader';
import NoProbesController from '@controllers/NoProbes';
import type { ListProbeRequest, ListProbeResponse } from '@api/core';
import type { ChaosProbesSelectionProps, ChaosProbesSelectionTableProps } from '@controllers/SelectProbesTab/types';
import { MemoisedProbesTable } from './ProbesTable';

export interface SelectProbesTabViewProps {
  probesTableData: ChaosProbesSelectionTableProps | undefined;
  loading: boolean;
  refetch: (variables?: Partial<ListProbeRequest> | undefined) => Promise<ApolloQueryResult<ListProbeResponse>>;
  setProbe: React.Dispatch<React.SetStateAction<ChaosProbesSelectionProps | undefined>>;
}

function SelectProbesTabView({
  probesTableData,
  loading,
  refetch,
  setProbe
}: SelectProbesTabViewProps): React.ReactElement {
  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{
        minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xxlarge))' : 'initial'
      }}
    >
      <Layout.Vertical height={'60vh'} spacing={'medium'} padding={{ left: 'small', right: 'small' }}>
        {probesTableData?.content && !isEmpty(probesTableData.content) ? (
          <MemoisedProbesTable {...probesTableData} setProbe={setProbe} />
        ) : (
          <NoProbesController refetch={refetch} />
        )}
      </Layout.Vertical>
    </Loader>
  );
}

export default withErrorBoundary(SelectProbesTabView, { FallbackComponent: Fallback });
