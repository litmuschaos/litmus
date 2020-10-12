export interface TemplateData {
  selectedTemplateID: number;
  isDisable: boolean;
}

export enum TemplateSelectionActions {
  SELECT_TEMPLATE = 'SELECT_TEMPLATE',
}

interface TemplateSelectionActionType<T, P> {
  type: T;
  payload: P;
}

export type TemplateSelectionAction = TemplateSelectionActionType<
  typeof TemplateSelectionActions.SELECT_TEMPLATE,
  TemplateData
>;
