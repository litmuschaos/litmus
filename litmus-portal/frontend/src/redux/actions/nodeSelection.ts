/* eslint-disable import/prefer-default-export */
import { Node } from '../../models/graphql/workflowData';
import {
  NodeSelectionAction,
  NodeSelectionActions,
} from '../../models/redux/nodeSelection';

export function selectNode(node: Node): NodeSelectionAction {
  return {
    type: NodeSelectionActions.SELECT_NODE,
    payload: node,
  };
}
