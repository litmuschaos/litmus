import { AnalyticsAction } from './analytics';
import { UserAction } from './user';
import { WorkflowAction } from './workflow';

export * from './predefinedWorkflow';

export type Action = UserAction | AnalyticsAction | WorkflowAction;
