export default [
  {
    workflowID: '1',
    title: 'node-cpu-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/node-cpu-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/ishangupta-ds/chaos-workflows/master/Argo/argowf-native-node-cpu-hog.yaml',

    gitLink:
      'https://github.com/ishangupta-ds/chaos-workflows/blob/master/Argo/argowf-native-node-cpu-hog.yaml',
    provider: 'MayaData',
    description: 'Injects a CPU spike on a node',
    totalRuns: 5300,
    isCustom: false,
  },
  {
    workflowID: '2',
    title: 'node-memory-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/node-memory-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/ishangupta-ds/chaos-workflows/master/Argo/argowf-native-node-memory-hog.yaml',

    gitLink:
      'https://github.com/ishangupta-ds/chaos-workflows/blob/master/Argo/argowf-native-node-memory-hog.yaml',
    provider: 'MayaData',
    description: 'Injects a memory spike on a node',
    totalRuns: 4300,
    isCustom: false,
  },
  {
    workflowID: '3',
    title: 'pod-cpu-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-cpu-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/ishangupta-ds/chaos-workflows/master/Argo/argowf-native-pod-cpu-hog.yaml',

    gitLink:
      'https://github.com/ishangupta-ds/chaos-workflows/blob/master/Argo/argowf-native-pod-cpu-hog.yaml',
    provider: 'MayaData',
    description: 'Injects a CPU spike on a pod',
    totalRuns: 5000,
    isCustom: false,
  },
  {
    workflowID: '4',
    title: 'pod-memory-hog',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-memory-hog.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/ishangupta-ds/chaos-workflows/master/Argo/argowf-native-pod-memory-hog.yaml',

    gitLink:
      'https://github.com/ishangupta-ds/chaos-workflows/blob/master/Argo/argowf-native-pod-memory-hog.yaml',
    provider: 'MayaData',
    description: 'Injects a memory spike on a pod',
    totalRuns: 3005,
    isCustom: false,
  },
  {
    workflowID: '5',
    title: 'pod-delete',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-delete.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/ishangupta-ds/chaos-workflows/master/Argo/argowf-native-pod-delete.yaml',

    gitLink:
      'https://github.com/ishangupta-ds/chaos-workflows/blob/master/Argo/argowf-native-pod-delete.yaml',
    provider: 'MayaData',
    description: 'Deletes a pod',
    totalRuns: 6700,
    isCustom: false,
  },
];
