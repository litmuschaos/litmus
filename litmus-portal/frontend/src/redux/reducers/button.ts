/* eslint-disable import/prefer-default-export */
import {
  InfoButtonData,
  InfoToggledAction,
  InfoToggledActions,
} from '../../models/redux/button';
import createReducer from './createReducer';

const initialState: InfoButtonData = {
  isInfoToggled: false,
};

export const toggleInfoButton = createReducer<InfoButtonData>(initialState, {
  [InfoToggledActions.TOGGLE_BUTTON](
    state: InfoButtonData,
    action: InfoToggledAction
  ) {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export default toggleInfoButton;
