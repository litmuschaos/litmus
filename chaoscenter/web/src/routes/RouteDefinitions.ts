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
  toChaosHubs(): string;
  toChaosHub(params: { hubID: string }): string;
  toChaosProbes(): string;
  toChaosProbe(params: { probeID: string }): string;
  toPredefinedExperiment(params: { hubID: string; experimentName: string }): string;
  toChaosFault(params: { hubID: string; faultName: string }): string;
  toEnvironments(): string;
  toChaosInfrastructures(params: { environmentID: string }): string;
  toKubernetesChaosInfrastructures(params: { environmentID: string }): string;
  toKubernetesChaosInfrastructureDetails(params: { chaosInfrastructureID: string; environmentID: string }): string;
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
  toExperimentRunDetailsViaNotifyID: ({ experimentID, notifyID }) =>
    `/experiments/${experimentID}/notifyID/${notifyID}`,
  // chaoshub routes
  toChaosHubs: () => '/chaos-hubs',
  toChaosHub: ({ hubID }) => `/chaos-hubs/${hubID}`,
  toPredefinedExperiment: ({ hubID, experimentName }) => `/chaos-hubs/${hubID}/experiment/${experimentName}`,
  toChaosFault: ({ hubID, faultName }) => `/chaos-hubs/${hubID}/fault/${faultName}`,
  // chaos probe routes
  toChaosProbes: () => '/probes',
  toChaosProbe: ({ probeID }) => `/probes/${probeID}`,
  toEnvironments: () => '/environments',
  // chaos infrastructures routes
  toChaosInfrastructures: ({ environmentID }) => `/environments/${environmentID}`,
  toKubernetesChaosInfrastructures: ({ environmentID }) => `/environments/${environmentID}/kubernetes`,
  toKubernetesChaosInfrastructureDetails: ({ chaosInfrastructureID, environmentID }) =>
    `/environments/${environmentID}/kubernetes/${chaosInfrastructureID}`
};
