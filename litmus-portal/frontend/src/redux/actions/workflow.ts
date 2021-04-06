/* eslint-disable import/prefer-default-export */
import {
  WorkflowAction,
  WorkflowActions,
  WorkflowData,
  WorkflowManifest,
} from '../../models/redux/workflow';

export const setWorkflowDetails = (data: WorkflowData): WorkflowAction => {
  return {
    type: WorkflowActions.SET_WORKFLOW_DETAILS,
    payload: data,
  };
};

export const setWorkflowManifest = (data: WorkflowManifest): WorkflowAction => {
  return {
    type: WorkflowActions.SET_WORKFLOW_MANIFEST,
    payload: data,
  };
};
