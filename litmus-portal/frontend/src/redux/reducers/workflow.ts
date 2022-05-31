import {
  LitmusCoreVersion,
  WorkflowAction,
  WorkflowActions,
  WorkflowData,
  WorkflowManifest,
} from '../../models/redux/workflow';
import createReducer from './createReducer';

const initialState: WorkflowData = {
  chaosEngineChanged: false,
  namespace: '',
  clusterID: '',
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
  clusterName: '',
};

const init: WorkflowManifest = {
  manifest: '',
  engineYAML: '',
  isCustomWorkflow: false,
  isUploaded: false,
};

const coreVersion: LitmusCoreVersion = {
  version: 'latest',
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

export const litmusCoreVersion = createReducer<LitmusCoreVersion>(coreVersion, {
  [WorkflowActions.SET_LITMUS_CORE_VERSION](
    state: LitmusCoreVersion,
    action: WorkflowAction
  ) {
    const version = action.payload;
    return {
      ...state,
      version,
    };
  },
});
