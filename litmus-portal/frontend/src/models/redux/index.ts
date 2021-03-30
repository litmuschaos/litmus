import { AlertAction } from './alert';
import { AnalyticsAction } from './analytics';
import { DashboardSelectionAction } from './dashboards';
import { DataSourceSelectionAction } from './dataSource';
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
  | AlertAction
  | TemplateSelectionAction
  | MyHubAction
  | DataSourceSelectionAction
  | DashboardSelectionAction;
