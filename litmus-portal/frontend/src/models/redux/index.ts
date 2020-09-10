import { AnalyticsAction } from './analytics';
import { NodeSelectionAction } from './nodeSelection';
import { UserAction } from './user';
import { WorkflowAction } from './workflow';

export type Action =
  | UserAction
  | AnalyticsAction
  | WorkflowAction
  | NodeSelectionAction;
