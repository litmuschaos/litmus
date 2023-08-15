import { Avatar, Container, Layout, Popover, Text, Utils } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import cx from 'classnames';
import { Color, FontVariation } from '@harnessio/design-system';
import React from 'react';
import { Link } from 'react-router-dom';
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import type { RecentExecutions } from '@controllers/ExperimentDashboardV2';
import { ExperimentRunStatus } from '@api/entities';
import { useStrings } from '@strings';
import {
  getColorBasedOnResilienceScore,
  getDetailedTime,
  getPropsBasedOnExperimentRunStatus,
  toSentenceCase
} from '@utils';
import { useRouteWithBaseUrl } from '@hooks';
import css from './StatusHeatMap.module.scss';

export interface StatusHeatMapProps {
  data: RecentExecutions[];
  experimentID: string;
  className?: string;
  onClick?: (item: RecentExecutions, event: React.MouseEvent) => void;
}

export interface StatusCell {
  execution: RecentExecutions;
}

export function StatusHeatMap(props: StatusHeatMapProps): React.ReactElement {
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();
  const { data, className, experimentID } = props;

  function hideIconForStatus(experimentRunStatus: ExperimentRunStatus): boolean {
    switch (experimentRunStatus) {
      case ExperimentRunStatus.COMPLETED:
      case ExperimentRunStatus.COMPLETED_WITH_PROBE_FAILURE:
      case ExperimentRunStatus.COMPLETED_WITH_ERROR:
      case ExperimentRunStatus.NA:
        return true;
      default:
        return false;
    }
  }

  function StatusCell({ execution }: StatusCell): React.ReactElement {
    const { iconName, iconColor, color } = getPropsBasedOnExperimentRunStatus(execution.experimentRunStatus);

    return (
      <div
        data-state={execution?.experimentRunStatus?.replace(/ /g, '_').toLowerCase()}
        className={css.statusHeatMapCell}
      >
        {iconName && !hideIconForStatus(execution.experimentRunStatus) && (
          <Icon name={iconName} style={{ color: Utils.getRealCSSColor(iconColor ?? color) }} size={12} />
        )}
      </div>
    );
  }

  const PopoverContent = ({ execution }: StatusCell): React.ReactElement => {
    return (
      <Container padding="medium">
        <Layout.Vertical>
          <Layout.Horizontal
            height={30}
            spacing={'small'}
            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          >
            <Text width={100} font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
              {getString('resiliencyScore')}:
            </Text>
            <Container flex={{ justifyContent: 'flex-start' }}>
              <Layout.Vertical className={css.resilienceScoreContainer}>
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                  {execution.experimentRunStatus === ExperimentRunStatus.QUEUED ||
                  execution.experimentRunStatus === ExperimentRunStatus.TIMEOUT ||
                  execution.experimentRunStatus === ExperimentRunStatus.RUNNING ? (
                    <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.WHITE}>
                      {'--'}
                    </Text>
                  ) : (
                    <Text
                      font={{ size: 'medium', weight: 'semi-bold' }}
                      color={getColorBasedOnResilienceScore(execution.resilienceScore).primary}
                    >
                      {execution.resilienceScore ?? '--'}
                    </Text>
                  )}
                  <Text className={css.byNumber} font={{ size: 'small' }} color={Color.GREY_300}>
                    {`/100`}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal
            margin={{ bottom: 'xsmall' }}
            height={30}
            spacing={'small'}
            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          >
            <Text width={100} font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
              {getString('status')}:
            </Text>
            <StatusBadgeV2 status={execution.experimentRunStatus} entity={StatusBadgeEntity.ExperimentRun} />
          </Layout.Horizontal>

          <Layout.Horizontal
            height={30}
            spacing={'small'}
            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          >
            <Text width={100} font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
              {getString('executedBy')}:
            </Text>
            <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
              <Avatar
                hoverCard={false}
                name={execution.executedBy?.username ?? getString('chaosController')}
                size="small"
              />
              <Layout.Vertical padding={{ left: 'xsmall' }}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.WHITE} lineClamp={1}>
                  {execution.executedBy?.username !== 'pipeline' ? (
                    <>
                      {execution.executedBy?.username ?? getString('chaosController')}
                      {execution.executedBy?.username && ' | Manually'}
                    </>
                  ) : (
                    toSentenceCase(execution.executedBy?.username)
                  )}
                </Text>
                <Text style={{ fontSize: 9, marginTop: 1 }} color={Color.GREY_300} lineClamp={1}>
                  {getDetailedTime(execution.executedAt)}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    );
  };

  return (
    <div className={cx(css.statusHeatMap, className)}>
      {data.map((execution, index) => {
        return (
          <Popover
            disabled={execution.experimentRunStatus === ExperimentRunStatus.NA}
            key={index}
            position={Position.TOP}
            interactionKind={PopoverInteractionKind.HOVER}
            className={Classes.DARK}
            content={<PopoverContent execution={execution} />}
          >
            {execution.experimentRunID ? (
              <Link to={paths.toExperimentRunDetails({ experimentID: experimentID, runID: execution.experimentRunID })}>
                <StatusCell execution={execution} />
              </Link>
            ) : (
              <StatusCell execution={execution} />
            )}
          </Popover>
        );
      })}
    </div>
  );
}
