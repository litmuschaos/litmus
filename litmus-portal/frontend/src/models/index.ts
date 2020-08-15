import { AnalyticsAction } from './analytics';
import { UserAction } from './user';
import { WorkflowAction } from './workflow';

export type Action = UserAction | AnalyticsAction | WorkflowAction;
