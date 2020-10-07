/* eslint-disable import/prefer-default-export */
import {
  experimentMap,
  scheduleInput,
  scheduleType,
  WorkflowActions,
} from '../../models/redux/workflow';

export const setWorkflowDetails = (data: {
  name: string;
  link: string;
  yaml: string;
  id: string;
  description: string;
  weights: experimentMap[];
  isCustomWorkflow: boolean;
  clusterid: string;
  cronSyntax: string;
  scheduleType: scheduleType;
  scheduleInput: scheduleInput;
}) => (dispatch: Function) => {
  dispatch({
    type: WorkflowActions.SET_WORKFLOW_DETAILS,
    payload: data,
  });
};
