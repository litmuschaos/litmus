export default [
  {
    workflowID: 0,
    title: 'sock-shop-chaos',
    chaosinfra: false,
    urlToIcon: '/icons/sock-shop.png',
    chaosWkfCRDLink: `https://raw.githubusercontent.com/litmuschaos/chaos-charts/${process.env.REACT_APP_HUB_BRANCH_NAME}/workflows/sock-shop-demo/usingCmdProbe/workflow.yaml`,
    chaosWkfCRDLink_Recur: `https://raw.githubusercontent.com/litmuschaos/chaos-charts/${process.env.REACT_APP_HUB_BRANCH_NAME}/workflows/sock-shop-demo/usingCmdProbe/workflow_cron.yaml`,
    gitLink: `https://github.com/litmuschaos/chaos-charts/${process.env.REACT_APP_HUB_BRANCH_NAME}/workflows/sock-shop-demo`,
    experimentPath: 'sock-shop-demo/usingCmdProbe',
    provider: 'ChaosNative',
    description: 'Induces chaos on Sock-Shop application',
    totalRuns: 1000,
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
    title: 'podtato-head-chaos',
    chaosinfra: false,
    urlToIcon: '/icons/podtato_head.png',
    chaosWkfCRDLink: `https://raw.githubusercontent.com/litmuschaos/chaos-charts/${process.env.REACT_APP_HUB_BRANCH_NAME}/workflows/podtato-head/workflow.yaml`,
    chaosWkfCRDLink_Recur: `https://raw.githubusercontent.com/litmuschaos/chaos-charts/${process.env.REACT_APP_HUB_BRANCH_NAME}/workflows/podtato-head/workflow_cron.yaml`,
    gitLink: `https://github.com/litmuschaos/chaos-charts/tree/${process.env.REACT_APP_HUB_BRANCH_NAME}/workflows/podtato-head`,
    experimentPath: 'podtato-head',
    provider: 'ChaosNative',
    description: 'Induces chaos on podtato-head application',
    totalRuns: 300,
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
