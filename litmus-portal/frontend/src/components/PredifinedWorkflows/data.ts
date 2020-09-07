export default [
  {
    workflowID: '1',
    title: 'pod-delete',
    urlToIcon:
      'https://hub.litmuschaos.io/api/icon/1.7.0/generic/pod-delete.png',
    chaosWkfCRDLink:
      'https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/Argo/argowf-native-pod-delete.yaml',

    gitLink:
      'https://github.com/litmuschaos/chaos-workflows/blob/master/Argo/argowf-native-pod-delete.yaml',
    provider: 'MayaData',
    description: 'Deletes a pod.',
    totalRuns: 5300,
    isCustom: false,
  },
];
