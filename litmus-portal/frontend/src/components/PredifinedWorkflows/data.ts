export default [
  {
    workflowID: 0,
    title: 'node-cpu-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/node-cpu-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-cpu-hog/workflow.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/node-cpu-hog/workflow.yaml',
    provider: 'MayaData',
    description: 'Injects a CPU spike on a node',
    totalRuns: 5300,
    isCustom: false,
  },
  {
    workflowID: 1,
    title: 'node-memory-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/node-memory-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-memory-hog/workflow.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/node-memory-hog/workflow.yaml',
    provider: 'MayaData',
    description: 'Injects a memory spike on a node',
    totalRuns: 4300,
    isCustom: false,
  },
  {
    workflowID: 2,
    title: 'pod-cpu-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-cpu-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-cpu-hog/workflow.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/pod-cpu-hog/workflow.yaml',
    provider: 'MayaData',
    description: 'Injects a CPU spike on a pod',
    totalRuns: 5000,
    isCustom: false,
  },
  {
    workflowID: 3,
    title: 'pod-memory-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-memory-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-memory-hog/workflow.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/pod-memory-hog/workflow.yaml',
    provider: 'MayaData',
    description: 'Injects a memory spike on a pod',
    totalRuns: 3005,
    isCustom: false,
  },
  {
    workflowID: 4,
    title: 'pod-delete',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-delete.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/pod-delete/workflow.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/pod-delete/workflow.yaml',
    provider: 'MayaData',
    description: 'Deletes a pod',
    totalRuns: 6700,
    isCustom: false,
  },
];
