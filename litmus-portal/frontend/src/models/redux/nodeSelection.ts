import { Node } from '../graphql/workflowData';

export interface SelectedNode extends Node {
  pod_name: string;
}

export enum NodeSelectionActions {
  SELECT_NODE = 'SELECT_NODE',
}

interface NodeSelectionActionType<T, P> {
  type: T;
  payload: P;
}

export type NodeSelectionAction = NodeSelectionActionType<
  typeof NodeSelectionActions.SELECT_NODE,
  SelectedNode
>;
