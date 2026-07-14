import React from 'react';
import { Container, Layout, TableV2, Text } from '@harnessio/uicore';
import type { Column } from 'react-table';
import { Color } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import { useHistory } from 'react-router-dom';
import type { ExperimentRunFaultDetails, ExperimentRunFaultDetailsTableProps } from '@controllers/ExperimentRunHistory';
import { useRouteWithBaseUrl } from '@hooks';
import { getDurationBetweenTwoDates, killEvent } from '@utils';
import { useStrings } from '@strings';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import { ExperimentRunFaultStatus } from '@api/entities';
import Duration from '@components/Duration';
import css from './ExperimentRunHistoryTable.module.scss';

const ProbeResults = ({ passed, failed, na }: { passed: number; failed: number; na: number }): React.ReactElement => {
  const { getString } = useStrings();
  return (
    <Container className={css.probeResults}>
      <Layout.Vertical padding={{ right: 'small' }} spacing={'xsmall'} className={css.partition}>
        <Text font={{ size: 'small' }} color={Color.GREY_600}>
          {getString('total')}
        </Text>
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500}>
          {passed + failed + na}
        </Text>
      </Layout.Vertical>
      <Layout.Vertical padding={{ left: 'small', right: 'small' }} spacing={'xsmall'}>
        <Text font={{ size: 'small' }} color={Color.GREEN_700}>
          {getString('passed')}
        </Text>
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500}>
          {passed}
        </Text>
      </Layout.Vertical>
      <Layout.Vertical padding={{ left: 'small', right: 'small' }} spacing={'xsmall'}>
        <Text font={{ size: 'small' }} color={Color.RED_600}>
          {getString('failed')}
        </Text>
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500}>
          {failed}
        </Text>
      </Layout.Vertical>
      <Layout.Vertical padding={{ left: 'small' }} spacing={'xsmall'}>
        <Text font={{ size: 'small' }} color={Color.GREY_600}>
          {getString('NASlash')}
        </Text>
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500}>
          {na}
        </Text>
      </Layout.Vertical>
    </Container>
  );
};

const ExperimentRunFaultsTable = ({ content, ...props }: ExperimentRunFaultDetailsTableProps): React.ReactElement => {
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const columns: Column<ExperimentRunFaultDetails>[] = React.useMemo(() => {
    return [
      {
        Header: `Faults (${content.length})`,
        accessor: function accessor(row: ExperimentRunFaultDetails) {
          return (
            <Text style={{ fontSize: 13 }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
              {row.faultName}
            </Text>
          );
        },
        id: 'faults'
      },
      {
        Header: 'Status',
        accessor: function accessor(row: ExperimentRunFaultDetails) {
          return (
            row.faultStatus && <StatusBadgeV2 status={row.faultStatus} entity={StatusBadgeEntity.ExperimentRunFault} />
          );
        },
        id: 'faultVerdict',
        disableSortBy: true
      },
      {
        Header: 'Probe Results',
        accessor: function accessor(row: ExperimentRunFaultDetails) {
          return (
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
              {row.faultStatus !== ExperimentRunFaultStatus.RUNNING ? (
                <ProbeResults passed={row.probeStatus.passed} failed={row.probeStatus.failed} na={row.probeStatus.na} />
              ) : (
                '--'
              )}
            </Text>
          );
        },
        id: 'resultingPoints'
      },
      {
        Header: 'Fault Weight',
        accessor: function accessor(row: ExperimentRunFaultDetails) {
          return (
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
              {row.faultWeight} points
            </Text>
          );
        },
        id: 'faultWeight'
      },
      {
        Header: 'Duration',
        accessor: function accessor(row: ExperimentRunFaultDetails) {
          // <!-- timestamp ambiguity handler not required here since the data has already been parsed via helper functions -->
          const wasFaultStopped =
            row.faultStatus === ExperimentRunFaultStatus.STOPPED || row.faultStatus === ExperimentRunFaultStatus.NA;
          const calculateDurationAgainst = wasFaultStopped && !row.finishedAt ? row.startedAt : row.finishedAt;
          return (
            <Layout.Vertical spacing={'xsmall'}>
              <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK} lineClamp={1}>
                {getDurationBetweenTwoDates(row.startedAt, calculateDurationAgainst)}
              </Text>
              <Duration
                startTime={row.startedAt}
                endTime={calculateDurationAgainst}
                icon={wasFaultStopped ? 'expired' : 'time'}
                iconProps={{ size: 12 }}
                durationText=" "
                color={Color.GREY_500}
                font={{ size: 'small' }}
              />
            </Layout.Vertical>
          );
        },
        id: 'lastRunTime'
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container onClick={killEvent} style={{ backgroundColor: 'var(--grey-50)', borderRadius: 6 }}>
      <TableV2<ExperimentRunFaultDetails>
        className={css.faultsTable}
        columns={columns}
        data={content}
        onRowClick={faultDetails =>
          history.push({
            pathname: paths.toExperimentRunDetails({ experimentID: props.experimentID, runID: props.experimentRunID }),
            search: `fault=${faultDetails.faultID}`
          })
        }
      />
    </Container>
  );
};

export const MemoisedExperimentRunFaultsTable = React.memo(ExperimentRunFaultsTable, (prev, current) => {
  return isEqual(prev.content, current.content);
});
