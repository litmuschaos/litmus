import React from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { Text, Button, ButtonVariation } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Icon, IconName } from '@harnessio/icons';
import {
  DynamicPopover,
  DynamicPopoverHandlerBinding
} from '@components/PipelineDiagram/DynamicPopover/DynamicPopover';
import { ExperimentRunFaultStatus } from '@api/entities';
import { getChaosStatusProps } from '../utils';
import { DiagramDrag, DiagramType, Event } from '../../Constants';
import type { BaseReactComponentProps } from '../../types';
import SVGMarker from '../SVGMarker';
import { RenderNotStartedPopover, RenderPopover, ToolTipData } from './NodePopovers';
import css from './ChaosExecutionNode.module.scss';

interface ChaosExecutionNodeProps extends BaseReactComponentProps {
  status: string;
}

function ChaosExecutionNode(props: ChaosExecutionNodeProps): JSX.Element {
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

  function didStepStartExecution(): boolean {
    return stepStatus !== ExperimentRunFaultStatus.NA;
  }

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
        if (!didStepStartExecution()) return;
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
      <div ref={nodeRef} id={props.id} data-nodeid={props.id}>
        <div
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
                nodeName: props.name ?? props.data.name,
                stepStatus: props.status as ExperimentRunFaultStatus,
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
        render={didStepStartExecution() ? RenderPopover : RenderNotStartedPopover}
        bind={setDynamicPopoverHandler}
        usePortal
        hoverHideDelay={1}
      />
    </div>
  );
}

export default ChaosExecutionNode;
