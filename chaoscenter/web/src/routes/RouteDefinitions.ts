export function normalizePath(url: string): string {
  return url.replace(/\/{2,}/g, '/');
}

export function withProjectID<T>(fn: (args: T) => string) {
  return (params: T & { projectID: string }): string => {
    const path = fn(params);

    return `/project/${params.projectID}/${path.replace(/^\//, '')}`;
  };
}

export interface UseRouteDefinitionsProps {
  toRoot(): string;
  toLogin(): string;
  toDashboard(): string;
  toDashboardWithProjectID(params: { projectID: string }): string;
  toExperiments(): string;
  toNewExperiment(params: { experimentKey: string }): string;
  toCloneExperiment(params: { experimentKey: string }): string;
  toEditExperiment(params: { experimentKey: string }): string;
  toExperimentRunHistory(params: { experimentID: string }): string;
  toExperimentRunDetails(params: { experimentID: string; runID: string }): string;
  toExperimentRunDetailsViaNotifyID(params: { experimentID: string; notifyID: string }): string;
}

export interface ExternalPathProps {
  toCVAddMonitoringServicesEdit(params: { serviceIdentifier: string }): string;
  toExternalDashboard(params: { dashboardID: string }): string;
  toDashboardsMain(): string;
}

export const paths: UseRouteDefinitionsProps = {
  toRoot: () => '/',
  toLogin: () => '/login',
  toDashboard: () => '/dashboard',
  toDashboardWithProjectID: withProjectID(() => 'dashboard'),
  toExperiments: () => '/experiments',
  // chaos studio routes
  toNewExperiment: ({ experimentKey }) => `/experiments/new/${experimentKey}/chaos-studio`,
  toCloneExperiment: ({ experimentKey }) => `/experiments/clone/${experimentKey}/chaos-studio`,
  toEditExperiment: ({ experimentKey }) => `/experiments/${experimentKey}/chaos-studio`,
  // experiment details route
  toExperimentRunHistory: ({ experimentID }) => `/experiments/${experimentID}/runs`,
  toExperimentRunDetails: ({ experimentID, runID }) => `/experiments/${experimentID}/runs/${runID}`,
  toExperimentRunDetailsViaNotifyID: ({ experimentID, notifyID }) => `/experiments/${experimentID}/notifyID/${notifyID}`
};
