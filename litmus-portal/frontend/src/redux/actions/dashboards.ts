import {
  DashboardData,
  DashboardSelectionAction,
  DashboardSelectionActions,
} from '../../models/redux/dashboards';

export const selectDashboard = (
  data: DashboardData
): DashboardSelectionAction => {
  return {
    type: DashboardSelectionActions.SELECT_DASHBOARD,
    payload: data,
  };
};

export default selectDashboard;
