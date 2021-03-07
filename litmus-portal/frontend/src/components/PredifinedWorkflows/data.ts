export default [
  {
    workflowID: 0,
    title: 'sock-shop-resiliency-check',
    chaosinfra: false,
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-delete.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/sock-shop-demo/usingCmdProbe/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/sock-shop-demo/usingCmdProbe/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/tree/master/workflows/sock-shop-demo',
    provider: 'ChaosNative',
    description: 'Induces chaos on Sock-Shop application',
    totalRuns: 110,
    isCustom: false,
    details:
      'This workflow installs and executes chaos on the popular demo application sock-shop, ' +
      'that simulates an e-commerce website selling socks. It injects a transient fault on an upstream microservice ' +
      'pod (socks catalogue) while continuously checking the availability of the website. This workflow allows execution ' +
      'of the same chaos experiment against two versions of the sock-shop deployment: weak and resilient. ' +
      'The weak is expected to result in a failed workflow while the resilient succeeds, ' +
      'essentially highlighting the need for deployment best-practices.',
    recommendation:
      'Check whether the application is resilient to the pod failure, once the workflow is completed.',
    experimentinfo:
      'Provide the application info in spec.appinfo Override the experiment tunables if desired in experiments.spec.components.env',
  },
  {
    workflowID: 1,
    title: 'node-cpu-hog',
    chaosinfra: true,
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
    workflowID: 2,
    title: 'node-memory-hog',
    chaosinfra: true,
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
    workflowID: 3,
    title: 'kube-proxy-chaos',
    chaosinfra: false,
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
    workflowID: 4,
    title: 'namespaced-scope-chaos',
    chaosinfra: false,
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
