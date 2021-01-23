export interface InfoButtonData {
  isInfoToggled: boolean;
}

export enum InfoToggledActions {
  TOGGLE_BUTTON = 'TOGGLE_BUTTON',
}

interface InfoToggledActionType<T, P> {
  type: T;
  payload: P;
}

export type InfoToggledAction = InfoToggledActionType<
  typeof InfoToggledActions.TOGGLE_BUTTON,
  InfoButtonData
>;
