import React from 'react';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import { DiagramDrag, DiagramType, Event } from '../../Constants';
import CreateNode from './CreateNode';
import type { FireEventMethod } from '../../types';
import cssDefault from '../DefaultNode/DefaultNode.module.scss';
import css from './CreateNode.module.scss';

interface CreateNodeStageProps {
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  fireEvent?: FireEventMethod;
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  identifier: string;
  name: string;
  disabled?: boolean;
  node: CreateNodeStageProps;
  visible?: boolean;
  className?: string;
}
function CreateNodeStage(props: CreateNodeStageProps): React.ReactElement | null {
  return (
    <div
      data-nodeid="add-parallel"
      onMouseOver={() => {
        props.onMouseOver?.();
      }}
      onMouseLeave={() => {
        props.onMouseLeave?.();
      }}
      className={cssDefault.defaultNode}
      onDragOver={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={event => {
        props?.onDrop?.(event);
        event.stopPropagation();
        props?.fireEvent?.({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            entityType: DiagramType.CreateNew,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props,
            identifier: props.identifier
          }
        });
      }}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        if (props?.onClick) {
          props?.onClick(event);
          return;
        }
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            entityType: DiagramType.CreateNew,
            identifier: props.identifier
          }
        });
      }}
    >
      <CreateNode
        identifier={props.identifier}
        name={props.name}
        className={cx(
          props?.className,
          cssDefault.defaultCard,
          css.createNode,
          css.stageAddIcon,
          { [css.disabled]: defaultTo(props.disabled, false) },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { [css.selected]: (props?.node as any)?.isSelected }
        )}
      />
    </div>
  );
}

export default CreateNodeStage;
