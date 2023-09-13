export function normalizePath(url: string): string {
  return url.replace(/\/{2,}/g, '/');
}

export interface UseRouteDefinitionsProps {
  toRoot(): string;
  toLogin(): string;
  toDashboard(): string;
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
  toChaosProbe(params: { probeName: string }): string;
  toPredefinedExperiment(params: { hubID: string; experimentName: string }): string;
  toChaosFault(params: { hubID: string; faultName: string }): string;
  toEnvironments(): string;
  toChaosInfrastructures(params: { environmentID: string }): string;
  toKubernetesChaosInfrastructures(params: { environmentID: string }): string;
  toKubernetesChaosInfrastructureDetails(params: { chaosInfrastructureID: string; environmentID: string }): string;
  toAccountSettingsOverview(): string;
  toProjectSetup(): string;
  toProjectMembers(): string;
  toImageRegistry(): string;
  toGitops(): string;
}

export const paths: UseRouteDefinitionsProps = {
  toRoot: () => '/',
  toLogin: () => '/login',
  toDashboard: () => '/dashboard',
  toExperiments: () => '/experiments',
  // Chaos Studio Routes
  toNewExperiment: ({ experimentKey }) => `/experiments/new/${experimentKey}/chaos-studio`,
  toCloneExperiment: ({ experimentKey }) => `/experiments/clone/${experimentKey}/chaos-studio`,
  toEditExperiment: ({ experimentKey }) => `/experiments/${experimentKey}/chaos-studio`,
  // Experiment Details Route
  toExperimentRunHistory: ({ experimentID }) => `/experiments/${experimentID}/runs`,
  toExperimentRunDetails: ({ experimentID, runID }) => `/experiments/${experimentID}/runs/${runID}`,
  toExperimentRunDetailsViaNotifyID: ({ experimentID, notifyID }) =>
    `/experiments/${experimentID}/notifyID/${notifyID}`,
  // Chaoshub Routes
  toChaosHubs: () => '/chaos-hubs',
  toChaosHub: ({ hubID }) => `/chaos-hubs/${hubID}`,
  toPredefinedExperiment: ({ hubID, experimentName }) => `/chaos-hubs/${hubID}/experiment/${experimentName}`,
  toChaosFault: ({ hubID, faultName }) => `/chaos-hubs/${hubID}/fault/${faultName}`,
  // Chaos Probe Routes
  toChaosProbes: () => '/probes',
  toChaosProbe: ({ probeName }) => `/probes/${probeName}`,
  toEnvironments: () => '/environments',
  // Chaos Infrastructures Routes
  toChaosInfrastructures: ({ environmentID }) => `/environments/${environmentID}`,
  toKubernetesChaosInfrastructures: ({ environmentID }) => `/environments/${environmentID}/kubernetes`,
  toKubernetesChaosInfrastructureDetails: ({ chaosInfrastructureID, environmentID }) =>
    `/environments/${environmentID}/kubernetes/${chaosInfrastructureID}`,
  // Account Scoped Routes
  toAccountSettingsOverview: () => '/settings/overview',
  // Project Setup Routes
  toProjectSetup: () => '/setup',
  toProjectMembers: () => '/setup/members',
  toImageRegistry: () => `/setup/image-registry`,
  toGitops: () => `/setup/gitops`
};
