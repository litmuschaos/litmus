import React from 'react';
import { Color } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import type { FireEventMethod } from '../../../types';
import { DiagramDrag, DiagramType, Event } from '../../../Constants';
interface AddLinkNodeProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextNode: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any;
  parentIdentifier?: string;
  isParallelNode?: boolean;
  readonly?: boolean;
  identifier?: string;
  fireEvent?: FireEventMethod;
  prevNodeIdentifier: string;
  showAddLink?: boolean;
  data: T;
  className?: string;
  id?: string;
  isRightAddIcon?: boolean;
  setShowAddLink?: (data: boolean) => void;
}
export default function AddLinkNode<T>(props: AddLinkNodeProps<T>): React.ReactElement | null {
  return (
    <div
      style={{ ...props.style }}
      data-linkid={props?.identifier}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        props?.fireEvent?.({
          type: Event.AddLinkClicked,
          target: event.target,
          data: {
            prevNodeIdentifier: props?.prevNodeIdentifier,
            parentIdentifier: props?.parentIdentifier,
            isRightAddIcon: props?.isRightAddIcon,
            entityType: DiagramType.Link,
            identifier: props?.identifier,
            node: { ...props, ...props?.data }
          }
        });
      }}
      onDragOver={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        event.preventDefault();
        props?.setShowAddLink && props?.setShowAddLink(true);
      }}
      onDrop={event => {
        event.stopPropagation();
        props?.fireEvent?.({
          type: Event.DropLinkEvent,
          target: event.target,
          data: {
            entityType: DiagramType.Link,
            isRightAddIcon: props?.isRightAddIcon,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: { ...props, ...props?.data }
          }
        });
        props?.setShowAddLink && props?.setShowAddLink(false);
      }}
      className={props.className}
    >
      <Icon name="plus" color={Color.WHITE} />
    </div>
  );
}
