/* eslint-disable import/prefer-default-export */
import config from '../../config';
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

export const setLitmusCoreVersion = () => {
  return (dispatch: Function) => {
    fetch(`${config.grahqlEndpoint}/litmus_core_version`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        dispatch({
          type: WorkflowActions.SET_LITMUS_CORE_VERSION,
          payload: data.coreVersion as string,
        });
      })
      .catch(() => {
        dispatch({
          type: WorkflowActions.SET_LITMUS_CORE_VERSION,
          payload: 'latest',
        });
      });
  };
};
