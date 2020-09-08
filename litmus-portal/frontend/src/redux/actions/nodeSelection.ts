/* eslint-disable import/prefer-default-export */
import {
  NodeSelectionAction,
  NodeSelectionActions,
} from '../../models/nodeSelection';
import { Node } from '../../models/workflowData';

export function selectNode(node: Node): NodeSelectionAction {
  return {
    type: NodeSelectionActions.SELECT_NODE,
    payload: node,
  };
}
