import { AlertAction, AlertActions, AlertData } from '../../models/redux/alert';

export function changeAlertState(data: AlertData): AlertAction {
  return {
    type: AlertActions.SET_ALERT_STATE,
    payload: data,
  };
}
