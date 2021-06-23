export interface AlertData {
  isAlertOpen: boolean;
}

export enum AlertActions {
  SET_ALERT_STATE = 'SET_ALERT_STATE',
}

interface AlertActionType<T, P> {
  type: T;
  payload: P;
}

export type AlertAction = AlertActionType<
  typeof AlertActions.SET_ALERT_STATE,
  AlertData
>;
