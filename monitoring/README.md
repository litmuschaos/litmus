# Monitor Chaos

This directory contains chaos interleaved grafana dashboards along with the utilities needed to get started with monitoring chaos experiments and workflows.

## Components

- [Grafana Dashboards](https://github.com/litmuschaos/litmus/blob/master/monitoring/grafana-dashboards)

  > Contains chaos interleaved grafana dashboards for various native k8s and application metrics.

- [Utilities](https://github.com/litmuschaos/litmus/blob/master/monitoring/utils)

  > Contains utilities required to setup monitoring infrastructure on a kubernetes cluster.

### Setup the LitmusChaos Infrastructure

- Install the litmus chaos operator and CRDs

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.13.0.yaml
  ```

- Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
  ```

- Install the chaos experiments in admin(litmus) namespace

  ```
  kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.13.0?file=charts/generic/experiments.yaml -n litmus
  ```

### Setup the Monitoring Infrastructure

- Create monitoring namespace on the cluster

  ```
  kubectl create ns monitoring
  ```

- Setup prometheus TSDB

  > Model-1 (optional): Service monitor and prometheus operator model.

      Create the operator to instantiate all CRDs

      ```
      kubectl -n monitoring apply -f utils/prometheus/prometheus-operator/
      ```

      Deploy monitoring components

      ```
      kubectl -n monitoring apply -f utils/metrics-exporters-with-service-monitors/node-exporter/
      kubectl -n monitoring apply -f utils/metrics-exporters-with-service-monitors/kube-state-metrics/
      kubectl -n monitoring apply -f utils/alert-manager-with-service-monitor/
      kubectl -n litmus apply -f utils/metrics-exporters-with-service-monitors/litmus-metrics/chaos-exporter/
      ```

      Deploy prometheus instance and all the service monitors for targets

      ```
      kubectl -n monitoring apply -f utils/prometheus/prometheus-configuration/
      ```

      Note: To change the service type to NodePort, perform a `kubectl edit svc prometheus-k8s -n monitoring` and replace `type: LoadBalancer` to `type: NodePort`

  > Model-2 (optional): Prometheus scrape config model.

      Deploy prometheus components

      ```
      kubectl -n monitoring apply -f utils/prometheus/prometheus-scrape-configuration/
      ```

      Deploy metrics exporters

      ```
      kubectl -n monitoring apply -f utils/metrics-exporters/kube-state-metrics/
      kubectl -n monitoring apply -f utils/metrics-exporters/node-exporter/
      kubectl -n litmus apply -f utils/metrics-exporters/litmus-metrics/chaos-exporter/
      ```

- Apply the grafana manifests after deploying prometheus for all metrics.

  ```
  kubectl -n monitoring apply -f utils/grafana/
  ```

- You may access the grafana dashboard via the LoadBalancer (or NodePort) service IP or via a port-forward operation on localhost

  View the services running in the monitoring namespace

  ```
  kubectl get svc -n monitoring
  ```

  Now copy the EXTERNAL-IP of grafana and view it in the browser

  Default username/password credentials: `admin/admin`

- Add the prometheus datasource from monitoring namespace as DS_PROMETHEUS for Grafana via the Grafana Settings menu

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/data-source-config.png?raw=true)

- Import the grafana dashboards

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- Import the grafana dashboard "Node and Pod Chaos Demo" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/kubernetes/Node-and-pod-metrics-dashboard.json)
