/* eslint-disable import/prefer-default-export */
import {
  DashboardData,
  DashboardSelectionAction,
  DashboardSelectionActions,
} from '../../models/redux/dashboards';
import createReducer from './createReducer';

const initialState: DashboardData = {
  selectedDashboardID: '',
  refreshRate: 0,
};

export const selectDashboard = createReducer<DashboardData>(initialState, {
  [DashboardSelectionActions.SELECT_DASHBOARD](
    state: DashboardData,
    action: DashboardSelectionAction
  ) {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export default selectDashboard;
