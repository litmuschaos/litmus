import React from 'react';
import { Avatar, Layout, TableV2, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import type { Column, Row } from 'react-table';
import { useHistory } from 'react-router-dom';
import { Icon } from '@harnessio/icons';
import { getIcon, timeDifferenceForDate } from '@utils';
import { useStrings } from '@strings';
import { useRouteWithBaseUrl } from '@hooks';
import CopyButton from '@components/CopyButton';
import type { InfrastructureType, Probe } from '@api/entities';
import type { ChaosProbesTableProps, RefetchProbes } from '@controllers/ChaosProbes';
import { ProbeTabs } from '@models';
import { MenuCell } from './ChaosProbesTableMenu';
import { UpdateProbeModal } from './UpdateProbeModal';
import css from './ChaosProbes.module.scss';

export interface EditProbeData {
  name: string;
  infrastructureType: InfrastructureType;
}

const ChaosProbeTable = ({ content, refetchProbes }: ChaosProbesTableProps & RefetchProbes): React.ReactElement => {
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const [editProbe, setEditProbe] = React.useState<EditProbeData | undefined>();

  const columns: Column<Partial<Probe>>[] = React.useMemo(() => {
    return [
      {
        Header: `${getString('probeName')}`.toLocaleUpperCase(),
        id: 'probeName',
        Cell: ({ row: { original: data } }: { row: Row<Probe> }) => {
          return (
            <Layout.Vertical padding={{ right: 'small' }}>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
                <Text
                  font={{ size: 'medium', weight: 'semi-bold' }}
                  color={Color.PRIMARY_7}
                  margin={{ bottom: 'xsmall' }}
                  className={css.expName}
                  lineClamp={1}
                  onClick={() =>
                    history.push({
                      pathname: paths.toChaosProbe({ probeName: data.name }),
                      search: `?probeName=${data.name}&tab=${ProbeTabs.EXECUTION_RESULTS}`
                    })
                  }
                >
                  {data.name}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="small">
                <Text font={{ variation: FontVariation.SMALL, weight: 'light' }}>{getString('id')}:</Text>
                <Text className={css.id} lineClamp={1} font={{ variation: FontVariation.SMALL, weight: 'light' }}>
                  {data.name}
                </Text>
                <CopyButton stringToCopy={data.name} />
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: `${getString('type')}`.toLocaleUpperCase(),
        id: 'type',
        Cell: ({ row: { original: data } }: { row: Row<Probe> }) => {
          return (
            <Layout.Vertical>
              <Layout.Horizontal spacing={'medium'}>
                <Icon name={getIcon(data.type)} />

                <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500} lineClamp={1}>
                  {data.type}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: `${getString('referencedBy')}`.toLocaleUpperCase(),
        id: 'referencedBy',
        Cell: ({ row: { original: data } }: { row: Row<Probe> }) => {
          return (
            <Layout.Horizontal spacing={'small'}>
              <Text font={{ weight: 'semi-bold', size: 'large' }} color={Color.BLACK} lineClamp={1}>
                {data.referencedBy ?? 0}
              </Text>

              <Text
                font={{ weight: 'semi-bold', size: 'xsmall' }}
                margin={{ top: 'medium' }}
                color={Color.GREY_400}
                lineClamp={1}
              >
                {getString('faults')}
              </Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: `${getString('lastModified')}`.toLocaleUpperCase(),
        id: 'lastModified',
        Cell: ({ row: { original: data } }: { row: Row<Probe> }) => {
          return (
            <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
              <Avatar hoverCard={false} name={data.updatedBy?.username ?? getString('chaosController')} size="normal" />
              <Layout.Vertical spacing={'xsmall'}>
                <Text font={{ weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
                  {data.updatedBy?.username ?? getString('chaosController')}
                </Text>
                <Text font={{ size: 'small' }} color={Color.GREY_500} lineClamp={1}>
                  {timeDifferenceForDate(parseInt(data.updatedAt ?? ''))}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row }: { row: Row<Probe> }) => (
          <MenuCell row={row} refetchProbes={refetchProbes} setEditProbe={setEditProbe} />
        ),
        disableSortBy: true
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TableV2<Partial<Probe>>
        className={css.table}
        columns={columns}
        data={content}
        sortable
        onRowClick={rowDetails =>
          rowDetails.name &&
          history.push({
            pathname: paths.toChaosProbe({ probeName: rowDetails.name }),
            search: `probeName=${rowDetails.name}&tab=${ProbeTabs.EXECUTION_RESULTS}&infrastructureType=${rowDetails.infrastructureType}`
          })
        }
      />
      {editProbe && (
        <UpdateProbeModal
          refetchProbes={refetchProbes}
          isOpen={!!editProbe.name}
          hideDarkModal={() => setEditProbe(undefined)}
          probeName={editProbe.name}
          infrastructureType={editProbe.infrastructureType}
        />
      )}
    </>
  );
};

export const MemoisedChaosProbeDashboardTable = React.memo(ChaosProbeTable, (prev, current) => {
  return isEqual(prev.content, current.content);
});
