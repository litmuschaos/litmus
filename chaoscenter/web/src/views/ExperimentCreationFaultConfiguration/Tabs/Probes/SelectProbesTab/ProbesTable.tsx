import React from 'react';
import { Layout, TableV2, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { getIcon } from '@utils';
import type { ChaosProbesSelectionProps, ChaosProbesSelectionTableProps } from '@controllers/SelectProbesTab/types';
import css from './SelectProbesTab.module.scss';

const ProbesTable = ({
  content,
  setProbe
}: ChaosProbesSelectionTableProps & {
  setProbe: React.Dispatch<React.SetStateAction<ChaosProbesSelectionProps | undefined>>;
}): React.ReactElement => {
  const columns: Column<ChaosProbesSelectionProps>[] = React.useMemo(() => {
    return [
      {
        Header: 'Probes',
        id: 'probes',
        Cell: ({ row: { original: data } }: { row: Row<ChaosProbesSelectionProps> }) => {
          return (
            <Layout.Vertical>
              <Text lineClamp={1} font={{ variation: FontVariation.H6, weight: 'bold' }} color={Color.PRIMARY_7}>
                {data.probeName}
              </Text>
              <Text
                lineClamp={1}
                font={{ variation: FontVariation.TINY_SEMI, weight: 'light' }}
                margin={{ top: 'xsmall' }}
                color={Color.GREY_600}
              >
                {`ID: ${data.probeName}`}
              </Text>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'Type',
        id: 'type',
        Cell: ({ row: { original: data } }: { row: Row<ChaosProbesSelectionProps> }) => {
          return (
            <Layout.Vertical>
              <Layout.Horizontal spacing={'medium'}>
                <Icon name={getIcon(data.type)} size={20} />
                <Text font={{ weight: 'semi-bold' }} lineClamp={1}>
                  {data.type}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TableV2<ChaosProbesSelectionProps>
      className={css.table}
      columns={columns}
      data={content}
      sortable
      onRowClick={data => {
        setProbe(data);
      }}
    />
  );
};

export const MemoisedProbesTable = React.memo(ProbesTable, (prev, current) => {
  return isEqual(prev.content, current.content);
});
