import {
  TemplateData,
  TemplateSelectionAction,
  TemplateSelectionActions,
} from '../../models/redux/template';

export const selectTemplate = (data: TemplateData): TemplateSelectionAction => {
  return {
    type: TemplateSelectionActions.SELECT_TEMPLATE,
    payload: data,
  };
};

export default selectTemplate;
