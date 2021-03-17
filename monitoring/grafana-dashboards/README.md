# Grafana Dashboards

This directory contains chaos interleaved grafana dashboards to monitor chaos experiments and workflows.

## Categories

-   Kubernetes

    Contains generic K8s dashboards with data from node exporter and kube-state metrics.

    ```bash
    cd kubernetes
    ```

-   Sock Shop

    Contains application metrics dashboard for Sock Shop.

    ```bash
    cd sock-shop
    ```

## Auto-Configurations

The chaos interleaved grafana dashboards and a default prometheus datasource are auto-configured and automatically imported when you deploy grafana.

The following datasources and dashboard are auto-configured and imported:

The `datasource-configMaps.yaml` defines all the definitions of the datasource that are imported, currently the following datasources are imported:

### Datasources Configured

-   DS_PROMETHEUS: The prometheus datasource that is deployed while setting up the monitoring for chaos as mentioned [here](https://github.com/litmuschaos/litmus/tree/master/monitoring#setup-the-monitoring-infrastructure)

The `dashboard-configMaps.yaml` defines all the definitions of the dashboards that are imported, along with a provider that helps Grafana to plugin and import the dashboards. currently the following datasources are imported:

### Dashboards Imported

-   Kubernetes  
    -   [Node and pod metrics](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/kubernetes/Node-and-pod-metrics-dashboard.json)
-   percona-sql
    -   [MySQL Overview](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/percona-sql/MySQL-Overview-Interleaved.json)
    -   [Percona Galera Node Summary](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/percona-sql/PXC_Galera_Node_Summary_Interleaved.json)
-   Sock Shop
    -   [Sock shop performance under chaos](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/sock-shop/Sock-Shop-Performance-Under-Chaos.json)
