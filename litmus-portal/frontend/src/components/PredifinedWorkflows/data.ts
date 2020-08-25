const workflowsList = [
  {
    workflowID: '1',
    title: 'node-cpu-hog',
    urlToIcon: 'temp/node-cpu-hog.svg',
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
    workflowID: '2',
    title: 'node-memory-hog',
    urlToIcon: 'temp/node-memory-hog.svg',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/workflows/node-memory-hog/workflow.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-charts/blob/master/workflows/node-memory-hog/workflow.yaml',
    provider: 'MayaData',
    description: 'Injects a memory spike on a node',
    totalRuns: 5300,
    isCustom: false,
  },
];

export default workflowsList;
