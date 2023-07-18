import React from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { Text, Button, ButtonVariation } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { getStatusProps, getPositionOfAddIcon } from '../../utils';
import { DiagramDrag, DiagramType, Event } from '../../../Constants';
import SVGMarker from '../../SVGMarker';
import {
  BaseReactComponentProps,
  NodeType,
  ExecutionStatus,
  ExecutionStatusEnum,
  ExecutionPipelineNodeType
} from '../../../types';
import AddLinkNode from '../AddLinkNode/AddLinkNode';
import defaultCss from '../DefaultNode.module.scss';

const CODE_ICON: IconName = 'command-echo';

const TEMPLATE_ICON: IconName = 'template-library';
interface PipelineStepNodeProps extends BaseReactComponentProps {
  status: string;
}

function PipelineStepNode(props: PipelineStepNodeProps): JSX.Element {
  const allowAdd = defaultTo(props.allowAdd, false);
  const [showAddNode, setVisibilityOfAdd] = React.useState(false);
  const stepType = props.type || props?.data?.step?.stepType || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component;

  const stepStatus = defaultTo(props?.status, props?.data?.step?.status as ExecutionStatus);
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stepStatus as ExecutionStatus,
    ExecutionPipelineNodeType.NORMAL
  );
  const isSelectedNode = (): boolean => props.isSelected || props.id === props?.selectedNodeId;
  const isServiceStep = stepType === 'Service';
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return;
    }
    setVisibilityOfAdd(visibility);
  };

  const stepIcon = defaultTo(props?.icon, props?.data?.step?.icon);
  const onDropEvent = (event: React.DragEvent): void => {
    event.stopPropagation();

    props?.fireEvent?.({
      type: Event.DropNodeEvent,
      target: event.target,
      data: {
        entityType: DiagramType.Default,
        node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
        destination: props
      }
    });
  };
  // const isPrevNodeParallel = !!defaultTo(props.prevNode?.children?.length, 1)
  const isTemplateNode = props?.data?.isTemplateNode;
  return (
    <div
      className={cx(defaultCss.defaultNode, 'default-node', {
        draggable: !props.readonly
      })}
      onMouseOver={e => {
        e.stopPropagation();
        setAddVisibility(true);
      }}
      onMouseLeave={e => {
        e.stopPropagation();
        setAddVisibility(false);
      }}
      onClick={event => {
        event.stopPropagation();
        if (props?.onClick) {
          props.onClick(event);
          return;
        }
        props?.fireEvent?.({
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

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          setAddVisibility(true);
          event.preventDefault();
        }
      }}
      onDragLeave={event => {
        event.stopPropagation();

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          setAddVisibility(false);
        }
      }}
      onDrop={onDropEvent}
    >
      {!isServiceStep && (
        <div className={cx(defaultCss.markerStart, defaultCss.stepMarker, defaultCss.stepMarkerLeft)}>
          <SVGMarker />
        </div>
      )}
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={!props.readonly}
        className={cx(defaultCss.defaultCard, {
          [defaultCss.selected]: isSelectedNode(),
          [defaultCss.failed]: stepStatus === ExecutionStatusEnum.Failed,
          [defaultCss.runningNode]: stepStatus === ExecutionStatusEnum.Running,
          [defaultCss.skipped]: stepStatus === ExecutionStatusEnum.Skipped,
          [defaultCss.notStarted]: stepStatus === ExecutionStatusEnum.NotStarted
        })}
        style={{
          width: 64,
          height: 64
        }}
        onDragStart={event => {
          event.stopPropagation();
          props?.fireEvent?.({
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

          props?.fireEvent?.({
            type: Event.MouseEnterNode,
            target: event.target,
            data: { ...props }
          });
        }}
        onMouseLeave={event => {
          event.stopPropagation();
          setVisibilityOfAdd(false);
          props?.fireEvent?.({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: { ...props }
          });
        }}
      >
        <div className="execution-running-animation" />
        {props?.data?.isInComplete && (
          <Icon className={defaultCss.inComplete} size={12} name={'warning-sign'} color="orange500" />
        )}
        {stepIcon && (
          <>
            <Icon
              size={28}
              {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
              name={defaultTo(stepIcon, 'cross') as IconName}
            />
          </>
        )}
        {secondaryIcon && (
          <Icon
            name={secondaryIcon}
            style={secondaryIconStyle}
            size={13}
            className={defaultCss.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {props.data?.skipCondition && (
          <div className={defaultCss.conditional}>
            <Text
              tooltip={`Skip condition:\n${props.data?.skipCondition}`}
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} color="white" />
            </Text>
          </div>
        )}
        {props.data?.conditionalExecutionEnabled && (
          <div className={defaultCss.conditional}>
            <Text
              tooltip="Conditional Execution"
              tooltipProps={{
                isDark: true
              }}
            >
              <Icon size={26} name={'conditional-skip-new'} color="white" />
            </Text>
          </div>
        )}
        {isTemplateNode && (
          <Icon
            {...(isSelectedNode()
              ? { color: Color.WHITE, className: cx(defaultCss.primaryIcon, defaultCss.templateIcon), inverse: true }
              : { className: defaultCss.templateIcon })}
            size={8}
            name={TEMPLATE_ICON}
          />
        )}
        {CODE_ICON && (
          <Icon
            className={defaultCss.codeIcon}
            color={isSelectedNode() ? Color.WHITE : undefined}
            size={8}
            name={CODE_ICON}
          />
        )}
        <Button
          className={cx(defaultCss.closeNode, { [defaultCss.readonly]: props.readonly })}
          minimal
          icon="cross"
          variation={ButtonVariation.PRIMARY}
          iconProps={{ size: 10 }}
          onMouseDown={e => {
            e.stopPropagation();
            props?.fireEvent?.({
              type: Event.RemoveNode,
              target: e.target,
              data: { identifier: props?.identifier, node: props }
            });
          }}
          withoutCurrentColor={true}
        />
      </div>
      {!isServiceStep && (
        <div className={cx(defaultCss.markerEnd, defaultCss.stepMarker, defaultCss.stepMarkerRight)}>
          <SVGMarker />
        </div>
      )}
      {props.name && (
        <div className={defaultCss.nodeNameText}>
          <Text
            width={125}
            font={{ size: 'normal', align: 'center' }}
            color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
            padding={'small'}
            lineClamp={2}
          >
            {props.name}
          </Text>
        </div>
      )}
      {allowAdd && CreateNode && !props.readonly && !isServiceStep && (
        <CreateNode
          onMouseOver={() => setAddVisibility(true)}
          onDragOver={() => setAddVisibility(true)}
          onDrop={onDropEvent}
          onMouseLeave={() => setAddVisibility(false)}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
            props?.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                identifier: props?.identifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Default,
                node: props
              }
            });
          }}
          className={cx(defaultCss.addNode, defaultCss.stepAddNode, { [defaultCss.visible]: showAddNode })}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && !isServiceStep && !props.readonly && (
        <AddLinkNode<PipelineStepNodeProps>
          nextNode={props?.nextNode}
          parentIdentifier={props?.parentIdentifier}
          isParallelNode={props.isParallelNode}
          readonly={props.readonly}
          data={props}
          fireEvent={props.fireEvent}
          identifier={props.identifier}
          prevNodeIdentifier={props.prevNodeIdentifier as string}
          style={{ left: getPositionOfAddIcon(props) }}
          className={cx(
            defaultCss.addNodeIcon,
            // { [defaultCss.left]: !isPrevNodeParallel, [defaultCss.stepGroupLeft]: isPrevNodeParallel },
            defaultCss.stepAddIcon
            // { [defaultCss.stepGroupLeftAddLink]: !!props.parentIdentifier }
          )}
        />
      )}
      {!props?.nextNode && !isServiceStep && props?.parentIdentifier && !props.readonly && !props.isParallelNode && (
        <AddLinkNode<PipelineStepNodeProps>
          nextNode={props?.nextNode}
          style={{ right: getPositionOfAddIcon(props, true) }}
          parentIdentifier={props?.parentIdentifier}
          isParallelNode={props.isParallelNode}
          readonly={props.readonly}
          data={props}
          fireEvent={props.fireEvent}
          isRightAddIcon={true}
          identifier={props.identifier}
          prevNodeIdentifier={props.prevNodeIdentifier as string}
          className={cx(defaultCss.addNodeIcon, defaultCss.stepAddIcon)}
        />
      )}
    </div>
  );
}

export default PipelineStepNode;
