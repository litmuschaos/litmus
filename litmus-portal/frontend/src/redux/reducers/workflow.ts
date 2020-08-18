/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WorkflowAction,
  WorkflowActions,
  WorkflowData,
} from '../../models/workflow';
import createReducer from './createReducer';

const initialState: WorkflowData = {
  name: '',
  link: '',
  yaml: '',
  id: '',
  description: '',
  weights: [],
  isCustomWorkflow: false,
};

export const workflowData = createReducer<WorkflowData>(initialState, {
  [WorkflowActions.SET_WORKFLOW_DETAILS](
    state: WorkflowData,
    action: WorkflowAction
  ) {
    return {
      ...state,
      ...(action.payload as Object),
    };
  },
});

export default workflowData;
