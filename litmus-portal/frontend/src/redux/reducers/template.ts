/* eslint-disable import/prefer-default-export */
import {
  TemplateData,
  TemplateSelectionAction,
  TemplateSelectionActions,
} from '../../models/redux/template';
import createReducer from './createReducer';

const initialState: TemplateData = {
  selectedTemplateID: 0,
  isDisable: true,
};

export const selectTemplate = createReducer<TemplateData>(initialState, {
  [TemplateSelectionActions.SELECT_TEMPLATE](
    state: TemplateData,
    action: TemplateSelectionAction
  ) {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export default selectTemplate;
