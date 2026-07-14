import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout, Text } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { isEmpty } from 'lodash-es';
import { Fallback } from '@errors';
import Loader from '@components/Loader';
import type {
  ChaosProbesExecutionHistoryTableProps,
  RefetchProbeReference
} from '@controllers/ChaosProbeExecutionHistory/types';
import { useStrings } from '@strings';
import { MemoisedChaosExecutionHistoryTable } from './ExecutionHistoryTable';
import NoProbeExecution from './NoProbeExecution';

interface ChaosProbeExecutionHistoryViewProps {
  executionTableData: ChaosProbesExecutionHistoryTableProps | undefined;
  loading: boolean;
}

function ChaosProbeExecutionHistoryView({
  refetchProbeReference,
  executionTableData,
  loading
}: ChaosProbeExecutionHistoryViewProps & RefetchProbeReference): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{
        minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xxlarge))' : 'initial'
      }}
    >
      <Layout.Vertical
        height={'85vh'}
        spacing={'medium'}
        padding={{ left: 'small', right: 'small' }}
        style={{ overflowY: 'auto' }}
      >
        {executionTableData?.content && !isEmpty(executionTableData.content) ? (
          <>
            <Text
              font={{ weight: 'semi-bold' }}
              color={Color.GREY_900}
              padding={{ top: 'medium', left: 'medium', botton: 'medium' }}
            >
              {getString('allExecutions')} ({executionTableData.content[0].totalRuns})
            </Text>
            <MemoisedChaosExecutionHistoryTable {...executionTableData} refetchProbeReference={refetchProbeReference} />
          </>
        ) : (
          <NoProbeExecution height={'100%'} />
        )}
      </Layout.Vertical>
    </Loader>
  );
}

export default withErrorBoundary(ChaosProbeExecutionHistoryView, { FallbackComponent: Fallback });
