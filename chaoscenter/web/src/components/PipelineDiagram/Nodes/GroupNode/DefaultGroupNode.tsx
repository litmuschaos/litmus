import React, { CSSProperties } from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { DiagramDrag, DiagramType, Event } from '../../Constants';
import type { BaseReactComponentProps } from '../../types';
import css from '../DefaultNode/DefaultNode.module.scss';

interface GroupNodeProps extends BaseReactComponentProps {
  allowAdd: boolean;
  children: [];
  intersectingIndex: number;
  customNodeStyle?: CSSProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultSelected: any;
  parentIdentifier: string;
}
const getDisplayValue = (showAdd: boolean): string => (showAdd ? 'flex' : 'none');

function GroupNode(props: GroupNodeProps): React.ReactElement {
  const allowAdd = props.allowAdd ?? false;
  const [showAdd, setVisibilityOfAdd] = React.useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);
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

  const nodesInfo = React.useMemo(() => {
    return (
      props?.children
        ?.slice(props.intersectingIndex - 1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((node: any) => ({ name: node.name, icon: node.icon, identifier: node.identifier, type: node.type }))
    );
  }, [props?.children, props.intersectingIndex]);

  const getGroupNodeName = (): string => {
    return `${defaultTo(nodesInfo?.[0]?.name, '')} +  ${nodesInfo.length - 1} more stages`;
  };

  return (
    <div
      className={css.defaultNode}
      ref={nodeRef}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={(event: any) => {
        event.preventDefault();
        event.stopPropagation();
        props?.fireEvent?.({
          type: Event.ClickNode,
          target: event.target,
          data: {
            entityType: DiagramType.GroupNode,
            identifier: props?.identifier,
            nodesInfo
          }
        });
        props?.setSelectedNode?.(props?.identifier as string);
      }}
      onDragOver={event => {
        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          setAddVisibility(true);
          event.preventDefault();
        }
      }}
      onDragLeave={event => {
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
            entityType: DiagramType.Default as string,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            // last element of groupnode
            destination: props?.children?.slice(-1)?.[0]
          }
        });
      }}
    >
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          marginTop: -8,
          marginLeft: 8
        }}
      ></div>
      <div
        className={css.defaultCard}
        style={{
          position: 'absolute',
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          marginTop: -4,
          marginLeft: 4
        }}
      ></div>

      <div
        id={props.id}
        data-nodeid={props.id}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: defaultTo(props.width, 90),
          height: defaultTo(props.height, 40),
          marginTop: 32 - defaultTo(props.height, 64) / 2,
          ...props.customNodeStyle
        }}
      >
        <div className={css.iconGroup}>
          {nodesInfo[0].icon && <Icon size={28} name={nodesInfo[0].icon} />}
          {nodesInfo[1].icon && <Icon size={28} name={nodesInfo[1].icon} />}
        </div>
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
        style={{ cursor: 'pointer', lineHeight: '1.5', overflowWrap: 'normal', wordBreak: 'keep-all', height: 55 }}
        padding={'small'}
        lineClamp={2}
      >
        {getGroupNodeName()}
      </Text>
      {allowAdd ? (
        <div
          onClick={event => {
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
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: defaultTo(props.width, 90),
            height: defaultTo(props.height, 40),
            display: getDisplayValue(showAdd)
          }}
        >
          <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
        </div>
      ) : null}
    </div>
  );
}

export default GroupNode;
