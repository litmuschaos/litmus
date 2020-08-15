/* eslint-disable import/prefer-default-export */
import { WorkflowActions, experimentMap } from '../../models/workflow';

export const setWorkflowDetails = (data: {
  name: string;
  link: string;
  yaml: string;
  id: string;
  description: string;
  weights: experimentMap[];
  isCustomWorkflow: boolean;
}) => (dispatch: Function) => {
  dispatch({
    type: WorkflowActions.SET_WORKFLOW_DETAILS,
    payload: data,
  });
};
