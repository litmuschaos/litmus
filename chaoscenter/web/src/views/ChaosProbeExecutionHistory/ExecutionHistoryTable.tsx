import React from 'react';
import { Layout, TableV2, Text } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { getDetailedTime } from '@utils';
import type {
  RefetchProbeReference,
  ChaosProbesExecutionHistoryTableProps,
  ReferenceTableProps
} from '@controllers/ChaosProbeExecutionHistory/types';
import { useStrings } from '@strings';
import css from './ChaosProbeExecutionHistory.module.scss';

const ExecutionHistoryTable = ({
  content
}: ChaosProbesExecutionHistoryTableProps & RefetchProbeReference): React.ReactElement => {
  const columns: Column<ReferenceTableProps>[] = React.useMemo(() => {
    return [
      {
        Header: 'Fault Details',
        id: 'name',
        Cell: ({ row: { original: data } }: { row: Row<ReferenceTableProps> }) => {
          return (
            <Layout.Vertical padding={{ right: 'small' }}>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
                <Text
                  font={{ size: 'medium', weight: 'semi-bold' }}
                  color={Color.PRIMARY_7}
                  margin={{ bottom: 'xsmall' }}
                  className={css.expName}
                  lineClamp={1}
                >
                  {data.faultName}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'Probe Mode',
        id: 'mode',
        Cell: ({ row: { original: data } }: { row: Row<ReferenceTableProps> }) => {
          return (
            <Layout.Vertical>
              <Layout.Horizontal spacing={'medium'}>
                <Icon name={'play'} />

                <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500} lineClamp={1}>
                  {data.mode}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'Last referenced at',
        id: 'duration',
        Cell: ({ row: { original: data } }: { row: Row<ReferenceTableProps> }) => {
          const { getString } = useStrings();
          return (
            <Layout.Vertical spacing={'xsmall'}>
              <Text font={{ weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
                {data.executionHistory[data.executionHistory.length - 1].updatedBy?.username ??
                  getString('chaosController')}
              </Text>
              <Text font={{ size: 'small' }} color={Color.GREY_500} lineClamp={1}>
                {getDetailedTime(data.executionHistory[data.executionHistory.length - 1].updatedAt / 1000)}
              </Text>
            </Layout.Vertical>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <TableV2<ReferenceTableProps> className={css.table} columns={columns} data={content} sortable />;
};

export const MemoisedChaosExecutionHistoryTable = React.memo(ExecutionHistoryTable, (prev, current) => {
  return isEqual(prev.content, current.content);
});
