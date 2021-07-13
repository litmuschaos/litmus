export default [
  {
    dashboardTypeID: 'generic_pod_metrics',
    typeName: 'Pod metrics',
    urlToIcon: './icons/generic_pod_metrics_dashboard.svg',
    information:
      'This dashboard visualizes Pod level CPU and memory usage metrics interleaved with chaos events.',
    urlToDashboard:
      'https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/portal-dashboards/pod_metrics.json',
    chaosEventQueryTemplate:
      'litmuschaos_awaited_experiments{job="chaos-exporter"}',
    chaosVerdictQueryTemplate:
      'litmuschaos_experiment_verdict{job="chaos-exporter"}',
  },
  {
    dashboardTypeID: 'sock-shop',
    typeName: 'Sock Shop',
    urlToIcon: './icons/sock-shop_dashboard.svg',
    information:
      'This dashboard visualizes Sock Shop application metrics metrics interleaved with chaos events and chaos exporter metrics.',
    urlToDashboard:
      'https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/portal-dashboards/sock-shop.json',
    chaosEventQueryTemplate:
      'litmuschaos_awaited_experiments{job="chaos-exporter"}',
    chaosVerdictQueryTemplate:
      'litmuschaos_experiment_verdict{job="chaos-exporter"}',
  },
  {
    dashboardTypeID: 'generic_node_metrics',
    typeName: 'Node metrics',
    urlToIcon: './icons/generic_node_metrics_dashboard.svg',
    information:
      'This dashboard visualizes Node level CPU, memory, disk and IO utilization metrics interleaved with chaos events.',
    urlToDashboard:
      'https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/portal-dashboards/node_metrics.json',
    chaosEventQueryTemplate:
      'litmuschaos_awaited_experiments{job="chaos-exporter"}',
    chaosVerdictQueryTemplate:
      'litmuschaos_experiment_verdict{job="chaos-exporter"}',
  },
  {
    dashboardTypeID: 'custom',
    typeName: 'Custom dashboard',
    urlToIcon: './icons/custom_dashboard.svg',
    information: 'Create your own custom dashboard',
    chaosEventQueryTemplate:
      'litmuschaos_awaited_experiments{job="chaos-exporter"}',
    chaosVerdictQueryTemplate:
      'litmuschaos_experiment_verdict{job="chaos-exporter"}',
  },
  {
    dashboardTypeID: 'upload',
    typeName: 'Upload a dashboard',
    urlToIcon: './icons/upload-json.svg',
    information: 'Create a dashboard by uploading a json file',
  },
];
