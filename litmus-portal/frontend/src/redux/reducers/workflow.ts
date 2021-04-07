/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WorkflowAction,
  WorkflowActions,
  WorkflowData,
  WorkflowManifest,
} from '../../models/redux/workflow';
import createReducer from './createReducer';

const initialState: WorkflowData = {
  chaosEngineChanged: false,
  namespace: 'litmus',
  clusterid: '',
  cronSyntax: '',
  scheduleType: {
    scheduleOnce: 'now',
    recurringSchedule: '',
  },
  scheduleInput: {
    hour_interval: 0,
    day: 1,
    weekday: 'Monday',
    time: new Date(),
    date: new Date(),
  },
  clustername: '',
};

const init: WorkflowManifest = {
  manifest: '',
  engineYAML: '',
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

export const workflowManifest = createReducer<WorkflowManifest>(init, {
  [WorkflowActions.SET_WORKFLOW_MANIFEST](
    state: WorkflowManifest,
    action: WorkflowAction
  ) {
    return {
      ...state,
      ...action.payload,
    };
  },
});
