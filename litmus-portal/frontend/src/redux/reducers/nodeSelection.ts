import {
  NodeSelectionAction,
  NodeSelectionActions,
} from '../../models/nodeSelection';
import { Node } from '../../models/workflowData';
import createReducer from './createReducer';

const initialState: Node = {
  children: null,
  finishedAt: '',
  name: '',
  phase: '',
  startedAt: '',
  type: '',
};

export const selectedNode = createReducer<Node>(initialState, {
  [NodeSelectionActions.SELECT_NODE](state: Node, action: NodeSelectionAction) {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export default selectedNode;
