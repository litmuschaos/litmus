import { AnalyticsAction } from './analytics';
import { MyHubAction } from './myhub';
import { NodeSelectionAction } from './nodeSelection';
import { TabAction } from './tabs';
import { TemplateSelectionAction } from './template';
import { WorkflowAction } from './workflow';

export type Action =
  | AnalyticsAction
  | WorkflowAction
  | NodeSelectionAction
  | TabAction
  | TemplateSelectionAction
  | MyHubAction;
