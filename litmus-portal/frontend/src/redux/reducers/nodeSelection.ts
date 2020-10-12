import {
  NodeSelectionAction,
  NodeSelectionActions,
  SelectedNode,
} from '../../models/redux/nodeSelection';
import createReducer from './createReducer';

const initialState: SelectedNode = {
  children: null,
  finishedAt: '',
  message: '',
  name: '',
  pod_name: '',
  phase: '',
  startedAt: '',
  type: '',
};

export const selectedNode = createReducer<SelectedNode>(initialState, {
  [NodeSelectionActions.SELECT_NODE](
    state: SelectedNode,
    action: NodeSelectionAction
  ) {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export default selectedNode;
