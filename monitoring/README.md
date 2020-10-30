# Monitor Chaos

This directory contains chaos interleaved grafana dashboards along with the utilities needed to get started with monitoring chaos experiments and workflows.

# Components

- [Grafana Dashboards](https://github.com/litmuschaos/litmus/blob/master/monitoring/grafana-dashboards)

  > Contains chaos interleaved grafana dashboards for various native k8s and application metrics.

- [Utilities](https://github.com/litmuschaos/litmus/blob/master/monitoring/utils)

  > Contains utilities required to setup monitoring infrastructure on a kubernetes cluster.

# Demonstration

## Monitor Chaos on Sock-Shop

Run chaos experiments and workflows on sock-shop application with grafana dashboard to monitor it.

### Step-1: Setup Sock-Shop Microservices Application

- Apply the sock-shop microservices manifests

  ```
  kubectl apply -f utils/sample-application-under-test/sock-shop/
  ```

- Wait until all services are up. Verify via `kubectl get pods -n sock-shop`

### Step-2: Setup the LitmusChaos Infrastructure

- Install the litmus chaos operator and CRDs

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.9.0.yaml
  ```

- Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
  ```

- Install the chaos experiments in admin(litmus) namespace

  ```
  kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.9.0?file=charts/generic/experiments.yaml -n litmus
  ```

### Step-3: Setup the Monitoring Infrastructure

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
    kubectl -n sock-shop apply -f utils/sample-application-service-monitors/sock-shop/
    kubectl -n litmus apply -f utils/metrics-exporters-with-service-monitors/litmus-metrics/chaos-exporter/
    kubectl -n litmus apply -f utils/metrics-exporters-with-service-monitors/litmus-metrics/litmus-event-router/
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
    kubectl -n litmus apply -f utils/metrics-exporters/litmus-metrics/litmus-event-router/
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

- Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/sock-shop/Sock-Shop-Performance-Under-Chaos.json)

- Import the grafana dashboard "Node and Pod Chaos Demo" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/kubernetes/Node-and-pod-metrics-dashboard.json)

### Step-4: Execute the Chaos Experiments

- For the sake of illustration, let us execute node and pod level, CPU hog experiments on the `catalogue` microservice & Memory Hog experiments on the `orders` microservice in a staggered manner.

```
kubectl apply -f utils/sample-chaos-injectors/chaos-experiments/catalogue/catalogue-pod-cpu-hog.yaml
```

Wait for ~60s

```
kubectl apply -f utils/sample-chaos-injectors/chaos-experiments/orders/orders-pod-memory-hog.yaml
```

Wait for ~60s

```
kubectl apply -f utils/sample-chaos-injectors/chaos-experiments/catalogue/catalogue-node-cpu-hog.yaml
```

Wait for ~60s

```
kubectl apply -f utils/sample-chaos-injectors/chaos-experiments/orders/orders-node-memory-hog.yaml
```

- Verify execution of chaos experiments

  ```
  kubectl describe chaosengine catalogue-pod-cpu-hog -n litmus
  kubectl describe chaosengine orders-pod-memory-hog -n litmus
  kubectl describe chaosengine catalogue-node-cpu-hog -n litmus
  kubectl describe chaosengine orders-node-memory-hog -n litmus
  ```

### Step-5: Visualize Chaos Impact

- Observe the impact of chaos injection through increased Latency & reduced QPS (queries per second) on the microservices
  under test.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Sock-Shop-Dashboard.png?raw=true)

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Node-and-Pod-metrics-Dashboard.png?raw=true)

### Step-6 (optional): Inject continous chaos using Argo CD.

- Install Chaos workflow infrastructure.

  - Create argo namespace

    ```
    kubectl create ns argo
    ```

  - Create the CRDs, workflow controller deployment with associated RBAC.

    ```
    kubectl apply -f https://raw.githubusercontent.com/argoproj/argo/stable/manifests/install.yaml -n argo
    ```

  - Install the argo CLI on the test harness machine (where the kubeconfig is available)

    ```bash
    # Download the binary
    curl -sLO https://github.com/argoproj/argo/releases/download/v2.11.0/argo-linux-amd64.gz

    # Unzip
    gunzip argo-linux-amd64.gz

    # Make binary executable
    chmod +x argo-linux-amd64

    # Move binary to path
    mv ./argo-linux-amd64 /usr/local/bin/argo

    # Test installation
    argo version
    ```

- Create the Argo Access ServiceAccount

  ```
  kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/Argo/argo-access.yaml -n litmus
  ```

- Run one or more of the litmuschaos experiments as Chaos workflows using argo CLI or kubectl.

  > Node CPU hog
  ```bash
  argo cron create utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/catalogue/catalogue-node-cpu-hog-workflow.yaml -n litmus
  ```

  > Node memory hog
  ```bash
  argo cron create utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/orders/orders-node-memory-hog-workflow.yaml -n litmus
  ```

  > Pod CPU hog

  ```bash
  kubectl apply -f utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/catalogue/catalogue-pod-cpu-hog-workflow.yaml -n litmus
  ```

  > Pod memory hog
  ```bash
  kubectl apply -f utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/orders/orders-pod-memory-hog-workflow.yaml -n litmus
  ```

- Visualize the Chaos cron workflow through argo UI by obtaining Node port or Load Balancer IP.

  ```
  kubectl patch svc argo-server -n argo -p '{"spec": {"type": "NodePort"}}'
  ```

  OR

  ```
  kubectl patch svc argo-server -n argo -p '{"spec": {"type": "LoadBalancer"}}'
  ```

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/chaos-workflow-representation.png?raw=true)

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/chaos-cron-workflows.png?raw=true)
