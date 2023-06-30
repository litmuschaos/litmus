import React from 'react';
import { v4 as uuid } from 'uuid';
import PipelineGraph from './PipelineGraph/PipelineGraph';
import GroupNode from './Nodes/GroupNode/GroupNode';
import type {
  BaseReactComponentProps,
  BaseListener,
  NodeCollapsibleProps,
  ListenerHandle,
  NodeBank,
  NodeDetails,
  PipelineGraphState
} from './types';
import { NodeType } from './types';
import { CANVAS_CLICK_EVENT } from './PipelineGraph/PipelineGraphUtils';
import DefaultNode from './Nodes/DefaultNode/DefaultNode';

export class DiagramFactory {
  /**
   * Couples the factory with the nodes it generates
   */
  type = '';
  canCreate = false;
  canDelete = false;
  nodeBank: NodeBank;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupNode: any = GroupNode;
  listeners: { [id: string]: BaseListener };
  constructor(diagramType?: string) {
    this.nodeBank = new Map<string, NodeDetails>();
    this.type = diagramType || 'graph';
    this.registerNode(NodeType.Default, DefaultNode as React.FC<BaseReactComponentProps>);
    this.listeners = {};
  }

  getType(): string {
    return this.type;
  }

  registerNode(type: string | string[], Component: React.FC<BaseReactComponentProps>, isDefault = false): void {
    if (Array.isArray(type)) {
      type.forEach(nodeType => this.nodeBank.set(nodeType, { component: Component, isDefault }));
    } else {
      this.nodeBank.set(type, { component: Component, isDefault });
    }
  }

  registerListeners(listeners: Record<string, BaseListener>): Record<string, ListenerHandle> {
    const result: Record<string, ListenerHandle> = {};
    Object.entries(listeners).forEach(listener => {
      const id = uuid();
      this.listeners[listener[0]] = listener[1];
      result[id] = {
        id: id,
        listener: listener[1],
        deregister: () => {
          delete this.listeners[id];
        }
      };
    });
    return result;
  }

  deregisterListener(listenerKey: string): boolean {
    if (this.listeners[listenerKey]) {
      delete this.listeners[listenerKey];
      return true;
    }
    return false;
  }

  getDefaultNode(): NodeDetails | null {
    let defaultNode = null;

    for (const node of this.nodeBank.entries()) {
      if (node[1].isDefault) {
        defaultNode = node[1];
      }
    }
    return defaultNode;
  }

  registerGroupNode(Component: React.FC): void {
    this.groupNode = Component;
  }

  getGroupNode(): React.FC {
    return this.groupNode;
  }

  getListenerHandle(listener: string): ListenerHandle | undefined {
    let listenerHandle;
    if (typeof listener === 'string') {
      const listernHandle = this.listeners[listener];
      return {
        id: listener,
        listener: listernHandle,
        deregister: () => {
          delete this.listeners[listener];
        }
      };
    }

    return listenerHandle;
  }

  getNode(type?: string): NodeDetails | null {
    const node = this.nodeBank.get(type as string);
    if (node) {
      return node;
    } else {
      return null;
    }
  }

  deregisterNode(type: string): void {
    const deletedNode = this.nodeBank.get(type);
    if (deletedNode) {
      this.nodeBank.delete(type);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fireEvent(event: any): void {
    this.getListenerHandle(event.type)?.listener?.(event);
  }

  render(): React.FC<{
    data: PipelineGraphState[];
    collapsibleProps?: NodeCollapsibleProps;
    selectedNodeId?: string;
    readonly?: boolean;
    loaderComponent?: React.FC;
    parentSelector?: string;
    panZoom?: boolean;
    createNodeTitle?: string;
    showEndNode?: boolean;
    graphActionsLayout?: 'horizontal' | 'vertical';
    graphLinkClassname?: string;
    initialZoomLevel?: number;
    disableGraphActions?: boolean;
  }> {
    function PipelineStudioHOC(
      this: DiagramFactory,
      props: {
        data: PipelineGraphState[];
        collapsibleProps?: NodeCollapsibleProps;
        selectedNodeId?: string;
        readonly?: boolean;
        loaderComponent?: React.FC;
        /** parent element selector to apply node grouping  */
        parentSelector?: string;
        panZoom?: boolean;
        createNodeTitle?: string;
        showEndNode?: boolean;
        graphActionsLayout?: 'horizontal' | 'vertical';
        graphLinkClassname?: string;
        initialZoomLevel?: number;
        disableGraphActions?: boolean;
      }
    ): React.ReactElement {
      return (
        <PipelineGraph
          getDefaultNode={this.getDefaultNode.bind(this)}
          getNode={this.getNode.bind(this)}
          fireEvent={this.fireEvent?.bind(this)}
          {...props}
        />
      );
    }
    return PipelineStudioHOC.bind(this);
  }
}

const DiagramNodes = {
  [NodeType.Default]: DefaultNode,
  [NodeType.GroupNode]: GroupNode
};

export { DiagramNodes, NodeType, BaseReactComponentProps, CANVAS_CLICK_EVENT };
