import React from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { Text, Button, ButtonVariation } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { getPositionOfAddIcon } from '../utils';
import { DiagramDrag, DiagramType, Event } from '../../Constants';
import { BaseReactComponentProps, NodeType } from '../../types';
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode';
import SVGMarker from '../SVGMarker';
import defaultCss from './ChaosExperimentNode.module.scss';

function ChaosExperimentNode(props: BaseReactComponentProps): JSX.Element {
  const allowAdd = defaultTo(props.allowAdd, false);
  const [showAddNode, setVisibilityOfAdd] = React.useState(false);

  const nodeRef = React.useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CreateNode: React.FC<any> | undefined = props.getNode?.(NodeType.CreateNode)?.component;

  const isSelectedNode = (): boolean => props.isSelected || props.id === props.selectedNodeId;
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return;
    }
    setVisibilityOfAdd(visibility);
  };

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
      <div className={cx(defaultCss.markerStart, defaultCss.stepMarker, defaultCss.stepMarkerLeft)}>
        <SVGMarker />
      </div>
      <div
        ref={nodeRef}
        id={props.id}
        data-nodeid={props.id}
        draggable={!props.readonly}
        className={cx(defaultCss.defaultCard, {
          [defaultCss.selected]: isSelectedNode()
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
        }}
        onMouseLeave={event => {
          event.stopPropagation();
          setVisibilityOfAdd(false);
          props.fireEvent?.({
            type: Event.MouseLeaveNode,
            target: event.target,
            data: { ...props }
          });
        }}
      >
        <Icon
          size={28}
          {...(isSelectedNode() ? { color: Color.WHITE, className: defaultCss.primaryIcon, inverse: true } : {})}
          // TODO: defaults to experiment icon
          name={defaultTo(props.icon, 'chaos-scenario-builder') as IconName}
        />
        {!props.readonly && (
          <Button
            className={defaultCss.closeNode}
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
      <div className={cx(defaultCss.markerEnd, defaultCss.stepMarker, defaultCss.stepMarkerRight)}>
        <SVGMarker />
      </div>
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
      {allowAdd && CreateNode && !props.readonly && (
        <CreateNode
          onMouseOver={() => setAddVisibility(true)}
          onDragOver={() => setAddVisibility(true)}
          onDrop={onDropEvent}
          onMouseLeave={() => setAddVisibility(false)}
          onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
            props.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                identifier: props.identifier,
                parentIdentifier: props.parentIdentifier,
                entityType: DiagramType.Default,
                node: props
              }
            });
          }}
          className={cx(defaultCss.addNode, defaultCss.stepAddNode, { [defaultCss.visible]: showAddNode })}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && !props.readonly && (
        <AddLinkNode<BaseReactComponentProps>
          nextNode={props.nextNode}
          parentIdentifier={props.parentIdentifier}
          isParallelNode={props.isParallelNode}
          readonly={props.readonly}
          data={props}
          fireEvent={props.fireEvent}
          identifier={props.identifier}
          prevNodeIdentifier={props.prevNodeIdentifier as string}
          style={{ left: getPositionOfAddIcon(props) }}
          className={cx(defaultCss.addNodeIcon, defaultCss.stepAddIcon)}
        />
      )}
    </div>
  );
}

export default ChaosExperimentNode;
