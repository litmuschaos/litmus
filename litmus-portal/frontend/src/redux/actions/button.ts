import {
  InfoButtonData,
  InfoToggledAction,
  InfoToggledActions,
} from '../../models/redux/button';

export const toggleInfoButton = (data: InfoButtonData): InfoToggledAction => {
  return {
    type: InfoToggledActions.TOGGLE_BUTTON,
    payload: data,
  };
};

export default toggleInfoButton;
