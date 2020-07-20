import { AnalyticsAction } from './analytics';
import { UserAction } from './user';

export type Action = UserAction | AnalyticsAction;
