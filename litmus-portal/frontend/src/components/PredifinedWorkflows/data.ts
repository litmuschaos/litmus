export default [
  {
    workflowID: 0,
    title: 'node-cpu-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/node-cpu-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-cpu-hog/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-cpu-hog/workflow_cron.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/node-cpu-hog',
    provider: 'MayaData',
    description: 'Injects a CPU spike on a node',
    totalRuns: 5300,
    isCustom: false,
    details:
      'This experiment causes CPU resource exhaustion on the Kubernetes node.' +
      'The experiment aims to verify resiliency of applications whose replicas may be ' +
      'evicted on account on nodes turning unschedulable (Not Ready) due to lack of CPU resources.',
    recommendation:
      'Check whether the application is resilient to the CPU hog, once the experiment (job) is completed.',
    experimentinfo:
      'Node CPU Hog can be effected using the chaos library: litmus, ' +
      'The desired chaos library can be selected by setting litmus as value for the env variable LIB',
  },
  {
    workflowID: 1,
    title: 'node-memory-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/node-memory-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-memory-hog/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-memory-hog/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/node-memory-hog',
    provider: 'MayaData',
    description: 'Injects a memory spike on a node',
    totalRuns: 4300,
    isCustom: false,
    details:
      ' This experiment causes Memory resource exhaustion on the Kubernetes node.' +
      'The experiment aims to verify resiliency of applications whose replicas may be ' +
      'evicted on account on nodes turning unschedulable (Not Ready) due to lack of Memory resources. ' +
      'The Memory chaos is injected using a job running the linux stress-ng tool (a workload generator). ' +
      'The chaos is effected for a period equalling the TOTAL_CHAOS_DURATION and upto ' +
      'MEMORY_PERCENTAGE(out of 100). Application implies services. Can be reframed as: Tests application ' +
      'resiliency upon replica evictions caused due to lack of Memory resources ',
    recommendation:
      'Check whether the application is resilient to the Memory hog, once the experiment (job) is completed',
    experimentinfo:
      'Provide the application info in spec.appinfo Provide the auxiliary applications ' +
      'info (ns & labels) in spec.auxiliaryAppInfo',
  },
  {
    workflowID: 2,
    title: 'pod-cpu-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-cpu-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-cpu-hog/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-cpu-hog/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/pod-cpu-hog',
    provider: 'MayaData',
    description: 'Injects a CPU spike on a pod',
    totalRuns: 5000,
    isCustom: false,
    details:
      'This experiment consumes the CPU resources on the application container (upward of 80%) ' +
      'on specified number of cores It simulates conditions where app pods experience CPU spikes ' +
      'either due to expected/undesired processes thereby testing how the overall application ' +
      'stack behaves when this occurs.',
    recommendation:
      'Check whether the application stack is resilient to CPU spikes on the app replica, once the experiment (job) is completed.',
    experimentinfo:
      'Use this sample RBAC manifest to create a chaosServiceAccount in the desired (app) namespace. ' +
      'This example consists of the minimum necessary role permissions to execute the experiment.',
  },
  {
    workflowID: 3,
    title: 'pod-memory-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-memory-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-memory-hog/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-memory-hog/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/pod-memory-hog',
    provider: 'MayaData',
    description: 'Injects a memory spike on a pod',
    totalRuns: 3005,
    isCustom: false,
    details:
      'This experiment consumes the Memory resources on the application container on specified memory in' +
      'megabytes. It simulates conditions where app pods experience Memory spikes either due to ' +
      'expected/undesired processes thereby testing how the overall application stack behaves when this occurs.',
    recommendation:
      'Check whether the application stack is resilient to Memory spikes on the app replica, once the experiment (job) is completed.',
    experimentinfo:
      'Pod Memory can be effected using the chaos library: litmus',
  },
  {
    workflowID: 4,
    title: 'pod-delete',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-delete.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-delete/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-delete/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/pod-delete',
    provider: 'MayaData',
    description: 'Deletes a pod',
    totalRuns: 6700,
    isCustom: false,
    details:
      'Causes (forced/graceful) pod failure of specific/random replicas of an application resources ' +
      'Tests deployment sanity (replica availability & uninterrupted service) and recovery workflow ' +
      'of the application The pod delete by Powerfulseal is only supporting single pod ' +
      'failure (kill_count = 1).',
    recommendation:
      'Check whether the application is resilient to the pod failure, once the experiment (job) is completed.',
    experimentinfo:
      'Provide the application info in spec.appinfo Override the experiment tunables if desired ' +
      'in experiments.spec.components.env ',
  },
  {
    workflowID: 5,
    title: 'kube-proxy-chaos',
    urlToIcon: 'https://hub.litmuschaos.io/api/icon/1.8.0/generic/generic.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/kube-proxy-all/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/kube-proxy-all/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/kube-proxy-all',
    provider: 'MayaData',
    description: 'Induces chaos on kube proxy',
    totalRuns: 9000,
    isCustom: false,
    details:
      'Causes (forced/graceful) pod failure of specific/random replicas of kube proxy and the node it runs on' +
      'Tests deployment sanity (replica availability & uninterrupted service) and recovery workflow ' +
      'of the application The workflow also simulates memory spike on kube proxy pod and its node.',
    recommendation:
      'Check whether the application is resilient to the kube proxy failure, once the argo chaos workflow is completed.',
    experimentinfo:
      'Provide the application info in spec.appinfo Override the individual experiment tunables if desired ' +
      'in experiments.spec.components.env ',
  },
  {
    workflowID: 6,
    title: 'namespaced-scope-chaos',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-delete.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/namespaced-scope-chaos/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/namespaced-scope-chaos/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/namespaced-scope-chaos',
    provider: 'MayaData',
    description: 'Induces chaos on Hello world application',
    totalRuns: 12000,
    isCustom: false,
    details:
      'Causes (forced/graceful) pod failure of specific/random replicas of hello world application resources ' +
      'Tests deployment sanity (replica availability & uninterrupted service) and recovery workflow ' +
      'of the application The pod delete by Powerfulseal is only supporting single pod ' +
      'failure (kill_count = 1).',
    recommendation:
      'Check whether the application is resilient to the pod failure, once the experiment (job) is completed.',
    experimentinfo:
      'Provide the application info in spec.appinfo Override the experiment tunables if desired ' +
      'in experiments.spec.components.env ',
  },
];
