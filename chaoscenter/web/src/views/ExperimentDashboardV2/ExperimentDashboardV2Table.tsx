import React from 'react';
import { Avatar, Container, Layout, TableV2, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import { cloneDeep, isEqual } from 'lodash-es';
import type { Column, Row } from 'react-table';
import { Classes, Popover, PopoverInteractionKind } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import cronstrue from 'cronstrue';
import * as parser from 'cron-parser';
import { getDetailedTime, killEvent } from '@utils';
import { useStrings } from '@strings';
import { useRouteWithBaseUrl } from '@hooks';
import CopyButton from '@components/CopyButton';
import { ExperimentRunStatus, InfrastructureType } from '@api/entities';
import type {
  ExperimentDashboardTableProps,
  ExperimentDetails,
  RefetchExperiments
} from '@controllers/ExperimentDashboardV2';
import DarkPopover from '@components/DarkPopover';
import CustomTagsPopover from '@components/CustomTagsPopover';
import StatusHeatMap from '@components/StatusHeatMap';
import { RunExperimentButton, StopExperimentButton } from '@components/ExperimentActionButtons';
import { StudioTabs } from '@models';
import { MenuCell } from './ExperimentDashboardV2TableMenu';
import css from './ExperimentDashboardV2.module.scss';

const CronDetails = ({ cronSyntax }: Pick<ExperimentDetails, 'cronSyntax'>): React.ReactElement => (
  <DarkPopover
    position="top"
    usePortal={true}
    disabled={!cronSyntax}
    interactionKind={PopoverInteractionKind.HOVER}
    content={
      <Layout.Vertical padding={'medium'}>
        <Text font={{ size: 'small' }} color={Color.WHITE}>
          {cronSyntax ? cronstrue.toString(cronSyntax.toString()) : '--'}
        </Text>
      </Layout.Vertical>
    }
  >
    <Container flex={{ justifyContent: 'flex-start' }}>
      <Icon width={14} size={cronSyntax ? 10 : 14} color={Color.GREY_500} name={cronSyntax ? 'repeat' : 'play'} />
      <Text
        margin={{ left: 'small' }}
        font={{ size: 'small' }}
        style={{ lineHeight: 1 }}
        color={Color.GREY_500}
        lineClamp={1}
      >
        {cronSyntax ? 'Cron' : 'Non-Cron'}
      </Text>
    </Container>
  </DarkPopover>
);

const ChaosInfrastructureDetails = ({
  infrastructure
}: Pick<ExperimentDetails, 'infrastructure'>): React.ReactElement => {
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  return (
    <Container
      flex={{ justifyContent: 'flex-start' }}
      onClick={() => {
        if (infrastructure.environmentID && infrastructure.infrastructureID) {
          history.push(
            paths.toKubernetesChaosInfrastructureDetails({
              environmentID: infrastructure.environmentID,
              chaosInfrastructureID: infrastructure.infrastructureID
            })
          );
        }
      }}
    >
      <Text font={{ size: 'small' }} margin={{ left: 'small' }} color={Color.PRIMARY_7} lineClamp={1}>
        {infrastructure.name}
      </Text>
    </Container>
  );
};

const ExperimentDashboardV2Table = ({
  content,
  pagination,
  refetchExperiments
}: ExperimentDashboardTableProps & RefetchExperiments): React.ReactElement => {
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const columns: Column<ExperimentDetails>[] = React.useMemo(() => {
    return [
      {
        Header: 'chaos experiments',
        id: 'chaosExperimentNameId',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentDetails> }) => {
          return (
            <Layout.Vertical spacing={'xsmall'}>
              <Layout.Horizontal
                flex={{ alignItems: 'start', justifyContent: 'flex-start' }}
                spacing="small"
                margin={{ right: 'small' }}
              >
                <Text font={{ size: 'normal', weight: 'bold' }} lineClamp={1} color={Color.PRIMARY_7}>
                  {data.experimentName}
                </Text>
                <CustomTagsPopover tags={data.experimentTags} />
              </Layout.Horizontal>
              <Layout.Horizontal
                width={'fit-content'}
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                spacing="small"
                onClick={killEvent}
              >
                {!data.experimentID ? (
                  <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_500}>
                    {getString('id')}: {getString('na')}
                  </Text>
                ) : (
                  <>
                    <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_500}>
                      {getString('id')}: {data.experimentID.slice(0, 8)}
                    </Text>
                    <CopyButton stringToCopy={data.experimentID} />
                  </>
                )}
              </Layout.Horizontal>
            </Layout.Vertical>
          );
        }
      },
      {
        Header: 'details',
        id: 'details',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentDetails> }) => {
          return (
            <Layout.Vertical spacing={'xsmall'} onClick={killEvent}>
              <CronDetails cronSyntax={data.cronSyntax} />
              <ChaosInfrastructureDetails infrastructure={data.infrastructure} />
            </Layout.Vertical>
          );
        }
      },
      {
        Header: (
          <div className={css.recentExecutionHeader}>
            <Layout.Horizontal spacing="xsmall" className={css.latestExecutionText} flex={{ alignItems: 'center' }}>
              <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
                {`${getString('mostRecentDirection')} `}
              </Text>
              <Icon size={10} name="arrow-right" color={Color.GREY_400} />
            </Layout.Horizontal>

            {getString('recentExperimentRuns')}
          </div>
        ),
        id: 'recentExecutions',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentDetails> }) => {
          let recentExecutions = cloneDeep(data.recentExecutions);
          // Fill the size to adopt UX that always displays 10 items
          if (recentExecutions.length < 10) {
            const fillExecutions = Array(10 - recentExecutions.length).fill({
              experimentRunStatus: ExperimentRunStatus.NA
            });
            recentExecutions = [...recentExecutions, ...fillExecutions];
          }
          return (
            <div style={{ width: 'fit-content' }} onClick={killEvent}>
              {data.recentExecutions && (
                <StatusHeatMap data={recentExecutions.reverse()} experimentID={data.experimentID} />
              )}
            </div>
          );
        }
      },
      {
        Header: 'last modified',
        id: 'modifiedBy',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentDetails> }) => {
          return (
            <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
              <Avatar hoverCard={false} name={data.updatedBy?.username ?? getString('chaosController')} size="normal" />
              <Layout.Vertical spacing={'xsmall'}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
                  {data.updatedBy?.username ?? getString('chaosController')}
                </Text>
                <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
                  {getDetailedTime(data.updatedAt)}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          );
        }
      },
      {
        Header: '',
        id: 'controlButtons',
        Cell: ({ row: { original: data } }: { row: Row<ExperimentDetails> }) => {
          const lastExperimentRunStatus = data.recentExecutions[0]?.experimentRunStatus;

          const nextRun = data.cronSyntax
            ? parser.parseExpression(data.cronSyntax.toString()).next().toString()
            : undefined;

          const ActionButton = (): React.ReactElement => {
            switch (lastExperimentRunStatus) {
              case ExperimentRunStatus.RUNNING:
                return (
                  <StopExperimentButton
                    experimentID={data.experimentID}
                    refetchExperiments={refetchExperiments}
                    infrastructureType={InfrastructureType.KUBERNETES}
                  />
                );
              case ExperimentRunStatus.QUEUED:
                return (
                  <StopExperimentButton
                    experimentID={data.experimentID}
                    refetchExperiments={refetchExperiments}
                    infrastructureType={InfrastructureType.KUBERNETES}
                  />
                );
              default:
                return <RunExperimentButton experimentID={data.experimentID} refetchExperiments={refetchExperiments} />;
            }
          };
          return (
            <Container onClick={killEvent} height={30} width={30}>
              {data.cronSyntax ? (
                <Popover
                  className={Classes.DARK}
                  usePortal={true}
                  position="top"
                  disabled={!nextRun}
                  interactionKind={PopoverInteractionKind.HOVER}
                  content={
                    <Layout.Vertical padding={'medium'}>
                      <Text font={{ size: 'small' }} color={Color.WHITE}>
                        {getString('nextRun')}: {nextRun?.substring(0, 34)}
                      </Text>
                    </Layout.Vertical>
                  }
                >
                  <Icon name="stopwatch" color={Color.GREY_500} size={25} />
                </Popover>
              ) : (
                <ActionButton />
              )}
            </Container>
          );
        }
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row }: { row: Row<ExperimentDetails> }) => <MenuCell row={{ ...row, refetchExperiments }} />,
        disableSortBy: true
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TableV2<ExperimentDetails>
      className={css.table}
      columns={columns}
      data={content}
      pagination={pagination}
      sortable
      onRowClick={rowDetails =>
        rowDetails.experimentID &&
        history.push({
          pathname: paths.toEditExperiment({ experimentKey: rowDetails.experimentID }),
          search: `tab=${StudioTabs.BUILDER}`
        })
      }
    />
  );
};

export const MemoisedExperimentDashboardV2Table = React.memo(ExperimentDashboardV2Table, (prev, current) => {
  return isEqual(prev.content, current.content);
});
