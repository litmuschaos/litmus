/* eslint-disable import/prefer-default-export */
import { TabAction, TabActions, TabState } from '../../models/redux/tabs';
import createReducer from './createReducer';

const initialState: TabState = {
  workflows: 0,
  settings: 0,
  node: 0,
  analytics: 0,
};

export const tabNumber = createReducer<TabState>(initialState, {
  [TabActions.CHANGE_WORKFLOWS_TAB](state: TabState, action: TabAction) {
    return {
      ...state,
      workflows: action.payload,
    };
  },
  [TabActions.CHANGE_SETTINGS_TAB](state: TabState, action: TabAction) {
    return {
      ...state,
      settings: action.payload,
    };
  },
  [TabActions.CHANGE_WORKFLOW_DETAILS_TAB](state: TabState, action: TabAction) {
    return {
      ...state,
      node: action.payload,
    };
  },
  [TabActions.CHANGE_ANALYTICS_DASHBOARD_TAB](
    state: TabState,
    action: TabAction
  ) {
    return {
      ...state,
      analytics: action.payload,
    };
  },
});

export default tabNumber;
