import React from 'react';
import { Avatar, Button, ButtonVariation, Layout, Popover, TableV2, Text } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import type { Column, Row, UseExpandedRowProps } from 'react-table';
import { Classes, Menu, MenuItem, Position } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { getDetailedTime, getColorBasedOnResilienceScore, killEvent } from '@utils';
import type { ExperimentRunDetails, ExperimentRunHistoryTableProps } from '@controllers/ExperimentRunHistory';
import { useStrings } from '@strings';
import { useRouteWithBaseUrl } from '@hooks';
import CopyButton from '@components/CopyButton';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import { ExperimentRunStatus } from '@api/entities';
import Duration from '@components/Duration';
import { MemoisedExperimentRunFaultsTable } from './ExperimentRunFaultTable';
import css from './ExperimentRunHistoryTable.module.scss';

const ExperimentRunHistoryTable = ({ content, pagination }: ExperimentRunHistoryTableProps): React.ReactElement => {
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();

  const columns: Column<ExperimentRunDetails>[] = React.useMemo(() => {
    return [
      {
        Header: '',
        id: 'toggleButton',
        Cell: ({ row }: { row: UseExpandedRowProps<ExperimentRunDetails> }) => (
          <Layout.Horizontal onClick={killEvent}>
            <Button
              {...row.getToggleRowExpandedProps()}
              color={Color.GREY_600}
              icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
              variation={ButtonVariation.ICON}
              iconProps={{ size: 19 }}
              className={css.toggleAccordion}
            />
          </Layout.Horizontal>
        ),
        disableSortBy: true
      },
      {
        Header: 'run #',
        id: 'runNameID',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => {
          return (
            <Layout.Vertical spacing={'xsmall'}>
              <Text font={{ size: 'normal', weight: 'bold' }} color={Color.PRIMARY_7}>
                {data.experimentRunName}
              </Text>
              <Layout.Horizontal
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                spacing="small"
                onClick={killEvent}
              >
                {!data.experimentRunID ? (
                  <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_500}>
                    {getString('id')}: {getString('na')}
                  </Text>
                ) : (
                  <>
                    <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_500}>
                      {getString('id')}: {data.experimentRunID.slice(0, 8)}
                    </Text>
                    <CopyButton stringToCopy={data.experimentRunID} />
                  </>
                )}
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'status',
        id: 'status',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => {
          return <StatusBadgeV2 status={data.experimentStatus} entity={StatusBadgeEntity.ExperimentRun} />;
        }
      },
      {
        Header: 'Resilience Score',
        id: 'resilienceScore',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => {
          return (
            <Layout.Vertical
              padding={{ left: 'small', top: 'medium', right: 'small', bottom: 'medium' }}
              width={100}
              className={css.resilienceScoreContainer}
            >
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                {data.experimentStatus === ExperimentRunStatus.QUEUED ||
                data.experimentStatus === ExperimentRunStatus.TIMEOUT ||
                data.experimentStatus === ExperimentRunStatus.RUNNING ? (
                  <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_700}>
                    {'--'}
                  </Text>
                ) : (
                  <Text
                    font={{ size: 'medium', weight: 'semi-bold' }}
                    color={getColorBasedOnResilienceScore(data.resilienceScore).primary}
                  >
                    {data.resilienceScore ?? '--'}
                  </Text>
                )}
                <Text className={css.byNumber} font={{ size: 'small' }} color={Color.GREY_500}>
                  {`/100`}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'executed by',
        id: 'executedBy',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => {
          return (
            <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
              <Avatar
                hoverCard={false}
                name={data.executedBy?.username ?? getString('chaosController')}
                size="normal"
              />
              <Layout.Vertical spacing={'xsmall'}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
                  {data.executedBy?.username ?? getString('chaosController')}
                  {data.executedBy?.username && ' | Manually'}
                </Text>
                <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
                  {/* timestamp ambiguity handler not required here since the data has already been parsed via helper functions */}
                  {getDetailedTime(isNaN(data.startedAt) ? data.executedAt : data.startedAt)}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: '',
        id: 'duration',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => {
          // <!-- timestamp ambiguity handler not required here since the data has already been parsed via helper functions -->
          return (
            <Duration
              startTime={data.startedAt}
              endTime={data.finishedAt}
              icon={isNaN(data.startedAt) && isNaN(data.finishedAt) ? 'expired' : 'time'}
              iconProps={{ size: 13 }}
              durationText=" "
              color={Color.GREY_500}
              font={{ size: 'small', weight: 'semi-bold' }}
            />
          );
        }
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => {
          return (
            <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
              <Popover className={Classes.DARK} position={Position.LEFT}>
                <Button variation={ButtonVariation.ICON} icon="Options" />
                <Menu style={{ backgroundColor: 'unset' }}>
                  <MenuItem
                    disabled={data.experimentRunID === ''}
                    text={getString('viewRun')}
                    className={css.menuItem}
                    onClick={() =>
                      history.push(
                        paths.toExperimentRunDetails({ experimentID: data.experimentID, runID: data.experimentRunID })
                      )
                    }
                  />
                  <MenuItem
                    disabled={data.experimentRunID === ''}
                    text={getString('openInNewTab')}
                    onClick={() => window.open(`${window.location.href}/runs/${data.experimentRunID}`, '_blank')}
                    className={css.menuItem}
                  />
                </Menu>
              </Popover>
            </Layout.Horizontal>
          );
        },
        disableSortBy: true
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TableV2<ExperimentRunDetails>
      className={css.table}
      columns={columns}
      data={content}
      pagination={pagination}
      sortable
      renderRowSubComponent={({ row: { original: data } }: { row: Row<ExperimentRunDetails> }) => (
        <MemoisedExperimentRunFaultsTable {...data.faultTableData} />
      )}
      onRowClick={rowDetails =>
        rowDetails.experimentRunID &&
        history.push(
          paths.toExperimentRunDetails({ experimentID: rowDetails.experimentID, runID: rowDetails.experimentRunID })
        )
      }
    />
  );
};

export const MemoisedExperimentRunHistoryTable = React.memo(ExperimentRunHistoryTable, (prev, current) => {
  return isEqual(prev.content, current.content);
});
