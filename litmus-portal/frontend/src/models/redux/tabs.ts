export interface TabState {
  workflows: number;
  settings: number;
}

export enum TabActions {
  CHANGE_WORKFLOWS_TAB = 'CHANGE_WORKFLOWS_TAB',
  CHANGE_SETTINGS_TAB = 'CHANGE_SETTINGS_TAB',
}

interface TabActionType<T, P> {
  type: T;
  payload: P;
}

export type TabAction =
  | TabActionType<typeof TabActions.CHANGE_WORKFLOWS_TAB, number>
  | TabActionType<typeof TabActions.CHANGE_SETTINGS_TAB, number>;
