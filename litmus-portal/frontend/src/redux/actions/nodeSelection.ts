/* eslint-disable import/prefer-default-export */
import {
  NodeSelectionAction,
  NodeSelectionActions,
  SelectedNode,
} from '../../models/redux/nodeSelection';

export function selectNode(node: SelectedNode): NodeSelectionAction {
  return {
    type: NodeSelectionActions.SELECT_NODE,
    payload: node,
  };
}
