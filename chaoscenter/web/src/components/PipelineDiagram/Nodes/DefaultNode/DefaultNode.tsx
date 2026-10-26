import React from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { Text, Button, ButtonVariation } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { DiagramDrag, DiagramType, Event } from '../../Constants';
import SVGMarker from '../SVGMarker';
import type { BaseReactComponentProps } from '../../types';
import css from './DefaultNode.module.scss';
interface DefaultNodeProps extends BaseReactComponentProps {
  disableClick?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draggable: any;
  dragging?: boolean;
}
function DefaultNode(props: DefaultNodeProps): JSX.Element {
  const allowAdd = defaultTo(props.allowAdd, false);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [showAdd, setVisibilityOfAdd] = React.useState(false);
  const setAddVisibility = (visibility: boolean): void => {
    if (!allowAdd) {
      return;
    }
    setVisibilityOfAdd(visibility);
  };

  React.useEffect(() => {
    const currentNode = nodeRef.current;
    const onMouseOver = (_e: MouseEvent): void => {
      setAddVisibility(true);
    };
    const onMouseLeave = (_e: MouseEvent): void => {
      setTimeout(() => {
        setAddVisibility(false);
      }, 100);
    };

    currentNode?.addEventListener?.('mouseover', onMouseOver);
    currentNode?.addEventListener?.('mouseleave', onMouseLeave);

    return () => {
      currentNode?.removeEventListener?.('mouseover', onMouseOver);
      currentNode?.removeEventListener?.('mouseleave', onMouseLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeRef, allowAdd]);

  const getCursorType = (): string => {
    if (props.disableClick) {
      return 'not-allowed';
    } else if (props.draggable) {
      return 'move';
    } else {
      return 'pointer';
    }
  };
  return (
    <div
      className={`${cx(css.defaultNode, 'default-node', { [css.marginBottom]: props.isParallelNode })} draggable`}
      ref={nodeRef}
      onClick={event => {
        event.stopPropagation();

        props?.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            ...props
          }
        });
        props?.setSelectedNode?.(props?.identifier as string);
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
      onDrop={event => {
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
      }}
    >
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={true}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          cursor: getCursorType(),
          opacity: props.dragging ? 0.4 : 1
        }}
        onDragStart={event => {
          event.stopPropagation();
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
      >
        <div className={css.markerStart}>
          <SVGMarker />
        </div>
        <div className="execution-running-animation" />
        {props.icon ? (
          <Icon
            size={28}
            name={props.icon as IconName}
            inverse={props?.isSelected}
            style={{ pointerEvents: 'none', ...props?.iconStyle }}
          />
        ) : null}
        <Button
          className={cx(css.closeNode, { [css.readonly]: props.readonly })}
          minimal
          icon="cross"
          variation={ButtonVariation.PRIMARY}
          iconProps={{ size: 10 }}
          onMouseDown={e => {
            e.stopPropagation();
            props?.fireEvent?.({
              type: Event.RemoveNode,
              target: e.target,
              data: {
                identifier: props?.identifier,
                node: props
              }
            });
          }}
          withoutCurrentColor={true}
        />
        <div className={css.markerEnd}>
          <SVGMarker />
        </div>
      </div>
      {props.name ? (
        <Text
          width={defaultTo(props.width, 90)}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={css.nameText}
          padding={'small'}
          lineClamp={2}
          data-node-name={props.name}
        >
          {props.name}
        </Text>
      ) : null}
      {allowAdd ? (
        <div
          onClick={event => {
            event.stopPropagation();
            props?.fireEvent?.({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                entityType: DiagramType.Default,
                identifier: props?.identifier,
                parentIdentifier: props?.parentIdentifier,
                node: props
              }
            });
          }}
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: defaultTo(props.width, 90),
            height: defaultTo(props.height, 40),
            visibility: showAdd ? 'visible' : 'hidden'
          }}
        >
          <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
        </div>
      ) : null}
    </div>
  );
}

export default DefaultNode;
