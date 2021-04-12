export default [
  {
    workflowID: 0,
    title: 'sock-shop-chaos',
    chaosinfra: false,
    urlToIcon: '/icons/sock-shop.png',
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
    title: 'kube-proxy-chaos',
    chaosinfra: true,
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
    isCustom: true,
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
    workflowID: 2,
    title: 'podtato-head-chaos',
    chaosinfra: false,
    urlToIcon: '/icons/podtato_head.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/podtato-head/workflow.yaml',
    chaosWkfCRDLink_Recur:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/podtato-head/workflow_cron.yaml',
    gitLink:
      'https://github.com/litmuschaos/chaos-charts/tree/master/workflows/podtato-head',
    provider: 'ChaosNative',
    description: 'Induces chaos on podtato-head application',
    totalRuns: 10,
    isCustom: false,
    details:
      'This workflow installs and executes chaos on the popular demo application podtato-head, ' +
      'A demo project for showcasing cloud-native application delivery use cases using different tools for various use cases.' +
      'It injects a transient fault on an upstream microservice ' +
      'pod while continuously checking the availability of the website. This workflow allows execution ' +
      'of the same chaos experiment against two versions of the podtato-head deployment: weak and resilient. ' +
      'The weak is expected to result in a failed workflow while the resilient succeeds, ' +
      'essentially highlighting the need for deployment best-practices.',
    recommendation:
      'Check whether the application is resilient to the pod failure, once the workflow is completed.',
    experimentinfo:
      'Provide the application info in spec.appinfo Override the experiment tunables if desired ' +
      'in experiments.spec.components.env ',
  },
];
