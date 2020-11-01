/* eslint-disable import/prefer-default-export */
import {
  customWorkflow,
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
  customWorkflow: customWorkflow;
  customWorkflows: customWorkflow[];
  stepperActiveStep: number;
}) => (dispatch: Function) => {
  dispatch({
    type: WorkflowActions.SET_WORKFLOW_DETAILS,
    payload: data,
  });
};
