/* eslint-disable import/prefer-default-export */
import {
  // SET_WORKFLOW_DETAILS,
  WorkflowData,
  WorkflowAction,
  WorkflowActions,
} from '../../models/redux/workflow';

export const setWorkflowDetails = (data: WorkflowData): WorkflowAction => {
  return {
    type: WorkflowActions.SET_WORKFLOW_DETAILS,
    payload: data,
  };
};

export default setWorkflowDetails;
