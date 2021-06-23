export const constants = {
  // Litmus HomePage [Component Used in -> LocalQuickActionCard]
  FeedbackForm: 'https://forms.gle/KQp5qj8MUneMSxLp9',

  /**
   * Schedule & Edit Schedule [Component Used in -> views/ScheduleWorkflow,
   * pages/EditSchedule/Schedule]
   * */
  recurringEveryHour: 'everyHr',
  recurringEveryDay: 'everyDay',
  recurringEveryWeek: 'everyWeek',
  recurringEveryMonth: 'everyMonth',

  /**
   * GVR and AppKind Constants [Component Used in -> TuneWorkflow/TargetApplication]
   */
  deployment: 'deployment',
  statefulset: 'statefulset',
  daemonset: 'daemonset',
  deploymentconfig: 'deploymentconfig',
  rollout: 'rollout',
  deployments: 'deployments',
  statefulsets: 'statefulsets',
  daemonsets: 'daemonsets',
  deploymentconfigs: 'deploymentconfigs',
  rollouts: 'rollouts',
  apps: 'apps',
  v1: 'v1',
  openshift: 'apps.openshift.io',
  argoproj: 'argoproj.io',
  v1alpha1: 'v1alpha1',
  appns: 'appns',
  appKind: 'appkind',
  appLabel: 'applabel',
  jobCleanUp: 'jobCleanUpPolicy',
  nodeselector: 'nodeselector',
  pods: 'pods',
  services: 'services',
  nodes: 'nodes',
  replicasets: 'replicasets',
  /**
   * Template Saved Constants [Component Used in -> Save Template Modal]
   */
  error: 'error',
  success: 'success',

  /**
   * Tuneworkflow index
   */
  adminMode: 'adminModeNamespace',
  chaosHub: 'Chaos Hub',
  workflow: 'Workflow',

  /**
   * Image Registry constants
   */
  dockerio: 'docker.io',
  docker: 'Docker Hub',
  litmus: 'litmuschaos',
  public: 'Public',
  private: 'Private',
};
