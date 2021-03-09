import { v4 as uuidv4 } from 'uuid';

export default [
  {
    dashboardID: 0,
    name: 'Kubernetes Platform',
    urlToIcon: '/icons/kubernetes-platform.svg',
    description: 'System Dashboard',
    information:
      'This dashboard visualizes Node and Pod level CPU and memory utilization metrics interleaved with chaos events.',
    chaosEventQueryTemplate:
      'litmuschaos_awaited_experiments{chaosresult_name="#{}",chaosresult_namespace="*{}", job="chaos-monitor"}',
    panelGroupMap: [
      {
        groupName: 'CPU Usage Metrics',
        panels: ['Chaos-Node-CPU Utilization', 'Chaos-Pod-CPU Usage'],
      },
      {
        groupName: 'Memory Usage Metrics',
        panels: ['Chaos-Node-Memory Utilization', 'Chaos-Pod-Memory Usage'],
      },
      {
        groupName: 'Disk Usage Metrics',
        panels: [
          'Chaos-Node-Disk I/O Usage R/W',
          'Chaos-Node-Disk I/O Usage Times',
        ],
      },
      {
        groupName: 'Network Usage Metrics',
        panels: [
          'Chaos-Node-Network Traffic Bytes',
          'Chaos-Node-Network Traffic Packets',
        ],
      },
    ],
    panelGroups: [
      {
        panel_group_name: 'CPU Usage Metrics',
        panels: [
          {
            panel_name: 'Chaos-Node-CPU Utilization',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'Cores',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: '%',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name: 'instance:node_cpu_utilisation:rate1m',
                legend: '{{instance}}',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
          {
            panel_name: 'Chaos-Pod-CPU Usage',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'Cores',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: '',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(container_cpu_usage_seconds_total{container!="POD",pod!=""}[5m])) by (pod)',
                legend: '{{pod}}',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Memory Usage Metrics',
        panels: [
          {
            panel_name: 'Chaos-Node-Memory Utilization',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'Memory',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: '%',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name: 'instance:node_memory_utilisation:ratio',
                legend: '{{instance}}',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
          {
            panel_name: 'Chaos-Pod-Memory Usage',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'Memory',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'GiB',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(container_memory_usage_bytes{container!="POD",container!=""}) by (pod)',
                legend: '{{pod}}',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Disk Usage Metrics',
        panels: [
          {
            panel_name: 'Chaos-Node-Disk I/O Usage R/W',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'bytes read (-) / write (+)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'KiB',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name: 'node_disk_read_bytes_total',
                legend: '{{instance}} - {{device}} - Successfully read bytes',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
              {
                queryid: uuidv4(),
                prom_query_name: 'node_disk_written_bytes_total',
                legend:
                  '{{instance}} - {{device}} - Successfully written bytes',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
          {
            panel_name: 'Chaos-Node-Disk I/O Usage Times',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name: 'node_disk_io_time_seconds_total',
                legend: '{{instance}} - {{device}} - Time spent doing I/Os',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Network Usage Metrics',
        panels: [
          {
            panel_name: 'Chaos-Node-Network Traffic Bits',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'bits out (-) / in (+)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'b/s',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name: 'node_network_receive_bytes_total*8',
                legend: '{{instance}} - {{device}} - Receive',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
              {
                queryid: uuidv4(),
                prom_query_name: 'node_network_transmit_bytes_total*8',
                legend: '{{instance}} - {{device}} - Transmit',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
          {
            panel_name: 'Chaos-Node-Network Traffic Packets',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'packets out (-) / in (+)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'p/s',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name: 'node_network_receive_packets_total',
                legend: '{{instance}} - {{device}} - Receive',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
              {
                queryid: uuidv4(),
                prom_query_name: 'node_network_transmit_packets_total',
                legend: '{{instance}} - {{device}} - Transmit',
                resolution: '1/2',
                minstep: '5',
                line: true,
                close_area: false,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    dashboardID: 1,
    name: 'Sock Shop',
    urlToIcon: '/icons/sock-shop.svg',
    description: 'Application Dashboard',
    information:
      'This dashboard visualizes Sock Shop application metrics metrics interleaved with chaos events and chaos exporter metrics.',
    chaosEventQueryTemplate:
      'litmuschaos_awaited_experiments{chaosresult_name="#{}",chaosresult_namespace="*{}", job="chaos-monitor"}',
    panelGroupMap: [
      {
        groupName: 'Orders Metrics',
        panels: ['Orders QPS', 'Orders Latency'],
      },
      {
        groupName: 'Catalogue Metrics',
        panels: ['Catalogue QPS', 'Catalogue Latency'],
      },
      {
        groupName: 'Payment Metrics',
        panels: ['Payment QPS', 'Payment Latency'],
      },
      {
        groupName: 'Shipping Metrics',
        panels: ['Shipping QPS', 'Shipping Latency'],
      },
      {
        groupName: 'User Metrics',
        panels: ['User QPS', 'User Latency'],
      },
      {
        groupName: 'Frontend Metrics',
        panels: ['Frontend QPS', 'Frontend Latency'],
      },
      {
        groupName: 'Cart Metrics',
        panels: ['Cart QPS', 'Cart Latency'],
      },
    ],
    panelGroups: [
      {
        panel_group_name: 'Orders Metrics',
        panels: [
          {
            panel_name: 'Orders QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="orders",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="orders", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'Orders Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="orders"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="orders"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="orders"}[1m])) / sum(rate(request_duration_seconds_count{job="orders"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Catalogue Metrics',
        panels: [
          {
            panel_name: 'Catalogue QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="catalogue",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="catalogue", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'Catalogue Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="catalogue"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="catalogue"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="catalogue"}[1m])) / sum(rate(request_duration_seconds_count{job="catalogue"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Payment Metrics',
        panels: [
          {
            panel_name: 'Payment QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="payment",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="payment", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'Payment Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="payment"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="payment"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="payment"}[1m])) / sum(rate(request_duration_seconds_count{job="payment"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Shipping Metrics',
        panels: [
          {
            panel_name: 'Shipping QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="shipping",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="shipping", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'Shipping Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="shipping"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="shipping"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="shipping"}[1m])) / sum(rate(request_duration_seconds_count{job="shipping"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'User Metrics',
        panels: [
          {
            panel_name: 'User QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="user",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="user", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'User Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="user"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="user"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="user"}[1m])) / sum(rate(request_duration_seconds_count{job="user"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Frontend Metrics',
        panels: [
          {
            panel_name: 'Frontend QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="front-end",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="front-end", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'Frontend Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="front-end"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="front-end"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="front-end"}[1m])) / sum(rate(request_duration_seconds_count{job="front-end"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
      {
        panel_group_name: 'Cart Metrics',
        panels: [
          {
            panel_name: 'Cart QPS',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'QPS (1 min)',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ops',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{job="carts",status_code=~"2..",route!="metrics"}[1m])) * 100',
                legend: '2xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_count{ job="carts", status_code=~"4.+|5.+" }[1m])) * 100',
                legend: '4xx/5xx',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
          {
            panel_name: 'Cart Latency',
            panel_options: {
              points: true,
              grids: true,
              left_axis: true,
            },
            y_axis_left: 'time',
            y_axis_right: 'CHAOS',
            x_axis_down: 'Time',
            unit: 'ms',
            prom_queries: [
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket{job="carts"}[1m])) by (name, le))',
                legend: '99th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'histogram_quantile(0.5, sum(rate(request_duration_seconds_bucket{job="carts"}[1m])) by (name, le))',
                legend: '50th quantile',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
              {
                queryid: uuidv4(),
                prom_query_name:
                  'sum(rate(request_duration_seconds_sum{job="carts"}[1m])) / sum(rate(request_duration_seconds_count{job="carts"}[1m]))',
                legend: 'Mean',
                resolution: '1/2',
                minstep: '5',
                line: false,
                close_area: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
