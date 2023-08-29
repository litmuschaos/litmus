import React from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { Text, Button, ButtonVariation, Container, Layout } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import type { IconName } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import {
  DynamicPopover,
  DynamicPopoverHandlerBinding
} from '@components/PipelineDiagram/DynamicPopover/DynamicPopover';
import type { ChaosResult } from '@models';
import { useStrings } from '@strings';
import ProbePassedFailedCount from '@components/ProbePassedFailedCount';
import { ExperimentRunFaultStatus, FaultProbeStatus } from '@api/entities';
import { phaseToUI } from '@utils';
import { getChaosStatusProps } from '../utils';
import { DiagramDrag, DiagramType, Event } from '../../Constants';
import type { BaseReactComponentProps } from '../../types';
import SVGMarker from '../SVGMarker';
import css from './ChaosExecutionNode.module.scss';

interface ChaosExecutionNodeProps extends BaseReactComponentProps {
  status: string;
}

interface ToolTipData {
  nodeName: string;
  phase: ExperimentRunFaultStatus;
  chaosResult: ChaosResult | undefined;
}

function ChaosExecutionNode(props: ChaosExecutionNodeProps): JSX.Element {
  const { getString } = useStrings();

  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<ToolTipData> | undefined
  >();

  const stepStatus = defaultTo(props.status, ExperimentRunFaultStatus.NA);
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getChaosStatusProps(
    stepStatus as ExperimentRunFaultStatus
  );
  const isSelectedNode = (): boolean => props.isSelected || props.id === props.selectedNodeId;

  const onDropEvent = (event: React.DragEvent): void => {
    event.stopPropagation();

    props.fireEvent?.({
      type: Event.DropNodeEvent,
      target: event.target,
      data: {
        entityType: DiagramType.Default,
        node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
        destination: props
      }
    });
  };

  const renderPopover = ({ nodeName, phase, chaosResult }: ToolTipData): JSX.Element => {
    let probePassed = 0;
    let probeFailed = 0;

    chaosResult?.status?.probeStatuses?.map(probe => {
      if (probe?.status?.verdict === FaultProbeStatus.PASSED) probePassed++;
    });

    chaosResult?.status?.probeStatuses?.map(probe => {
      if (probe?.status?.verdict === FaultProbeStatus.FAILED) probeFailed++;
    });

    return (
      <Container padding="medium">
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.BODY1 }} color={Color.WHITE} style={{ marginRight: 12 }}>
            {nodeName}
          </Text>
          <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
              {getString('executionStatus')}:
            </Text>
            <Container flex={{ justifyContent: 'flex-start' }}>
              {secondaryIcon && (
                <Icon
                  name={secondaryIcon}
                  style={secondaryIconStyle}
                  size={13}
                  {...secondaryIconProps}
                  margin={{ right: 'small' }}
                />
              )}
              <Text font={{ variation: FontVariation.H6 }} color={Color.WHITE}>
                {phaseToUI(phase)}
              </Text>
            </Container>
          </Layout.Horizontal>
        </Layout.Vertical>
        {nodeName !== 'install-chaos-faults' && nodeName !== 'cleanup-chaos-resources' && (
          <Container>
            <hr className={css.divider} />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.WHITE}>
              {getString('probeResult')}
            </Text>
            <ProbePassedFailedCount
              flexStart={false}
              phase={phase}
              passedCount={probePassed}
              failedCount={probeFailed}
              textColorInverse
            />
          </Container>
        )}
      </Container>
    );
  };

  return (
    <div
      className={cx(css.defaultNode, 'default-node', {
        draggable: !props.readonly
      })}
      onMouseOver={e => {
        e.stopPropagation();
      }}
      onMouseLeave={e => {
        e.stopPropagation();
      }}
      onClick={event => {
        event.stopPropagation();
        if (props.onClick) {
          props.onClick(event);
          return;
        }
        props.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            ...props
          }
        });
      }}
      onMouseDown={e => e.stopPropagation()}
      onDragOver={event => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onDragLeave={event => {
        event.stopPropagation();
      }}
      onDrop={onDropEvent}
    >
      <div className={cx(css.markerStart, css.stepMarker, css.stepMarkerLeft)}>
        <SVGMarker />
      </div>
      <div
        ref={nodeRef}
        id={props.id}
        data-nodeid={props.id}
        draggable={!props.readonly}
        className={cx(css.defaultCard, {
          [css.selected]: isSelectedNode(),
          [css.failed]: stepStatus === ExperimentRunFaultStatus.ERROR,
          [css.runningNode]: stepStatus === ExperimentRunFaultStatus.RUNNING,
          [css.skipped]: stepStatus === ExperimentRunFaultStatus.SKIPPED,
          [css.notStarted]: stepStatus === ExperimentRunFaultStatus.NA
        })}
        style={{
          width: 64,
          height: 64
        }}
        onDragStart={event => {
          event.stopPropagation();
          props.fireEvent?.({
            type: Event.DragStart,
            target: event.target,
            data: { ...props }
          });
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props));
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1');
          event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1');
          event.dataTransfer.dropEffect = 'move';
        }}
        onDragEnd={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onMouseEnter={event => {
          event.stopPropagation();
          dynamicPopoverHandler?.show(
            nodeRef.current as Element,
            {
              nodeName: props.data.name,
              phase: props.status as ExperimentRunFaultStatus,
              chaosResult: props.data.chaosResult
            },
            {
              useArrows: true,
              darkMode: true,
              fixedPosition: false,
              placement: 'top'
            }
          );
        }}
        onMouseLeave={event => {
          event.stopPropagation();
          dynamicPopoverHandler?.hide();
          props.fireEvent?.({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: { ...props }
          });
        }}
      >
        <div className="execution-running-animation" />
        <Icon
          size={25}
          {...(isSelectedNode() ? { color: Color.WHITE, className: css.primaryIcon, inverse: true } : {})}
          // TODO: defaults to experiment icon
          name={defaultTo(props.icon, 'chaos-scenario-builder') as IconName}
        />
        {secondaryIcon && (
          <Icon
            name={secondaryIcon}
            style={secondaryIconStyle}
            size={13}
            className={css.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {!props.readonly && (
          <Button
            className={css.closeNode}
            minimal
            icon="cross"
            variation={ButtonVariation.PRIMARY}
            iconProps={{ size: 10 }}
            onMouseDown={e => {
              e.stopPropagation();
              props.fireEvent?.({
                type: Event.RemoveNode,
                target: e.target,
                data: { identifier: props.identifier, node: props }
              });
            }}
            withoutCurrentColor={true}
          />
        )}
      </div>
      <div className={cx(css.markerEnd, css.stepMarker, css.stepMarkerRight)}>
        <SVGMarker />
      </div>
      {props.name && (
        <div className={css.nodeNameText}>
          <Text
            width={125}
            font={{ size: 'small', align: 'center' }}
            color={isSelectedNode() ? Color.GREY_800 : Color.GREY_600}
            padding={'small'}
            lineClamp={2}
          >
            {props.name}
          </Text>
        </div>
      )}
      <DynamicPopover
        darkMode={true}
        className={css.renderPopover}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
        usePortal
        hoverHideDelay={1}
      />
    </div>
  );
}

export default ChaosExecutionNode;
