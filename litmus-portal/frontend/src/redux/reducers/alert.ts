/* eslint-disable import/prefer-default-export */
import { AlertAction, AlertActions, AlertData } from '../../models/redux/alert';
import createReducer from './createReducer';

const initialState: AlertData = {
  isAlertOpen: false,
};

export const alert = createReducer<AlertData>(initialState, {
  [AlertActions.SET_ALERT_STATE](state: AlertData, action: AlertAction) {
    return {
      ...state,
      isAlertOpen: action.payload,
    };
  },
});

export default alert;
