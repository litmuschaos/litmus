# Monitor Chaos

This directory contains chaos interleaved grafana dashboards along with the utilities needed to get started with monitoring chaos experiments and workflows on Kublr platform.

The main difference from the standard getting started guide is that Kublr platform includes a centralized monitoring subsystem out of the box. As a result, there is no
need to set up prometheus and grafana to enable monitoring, it is possible to just enable monitoring integration in the test application and in Litmus.

# Components

-   [Grafana Dashboards](https://github.com/litmuschaos/litmus/blob/master/monitoring/platforms/kublr/grafana-dashboards)

    > Contains chaos interleaved grafana dashboards for various native k8s and application metrics. These dashboards are
    > modified slightly relative to the dashboards in the generic getting started guide to accomodate for additional labels
    > Kublr introduces in its centralized monitoring.

# Demonstration

## Monitor Chaos on Sock-Shop

Run chaos experiments and workflows on sock-shop application with grafana dashboard to monitor it.

### Step-1: Setup Sock-Shop Microservices Application

-   Apply the sock-shop microservices manifests

    ```
    kubectl apply -f ../../utils/sample-application-under-test/sock-shop/
    ```

-   Wait until all services are up. Verify via `kubectl get pods -n sock-shop`

### Step-2: Setup the LitmusChaos Infrastructure

-   Install the litmus chaos operator and CRDs

    ```
    kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.9.0.yaml
    ```

-   Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

    ```
    kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
    ```

-   Install the chaos experiments in admin(litmus) namespace

    ```
    kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.9.0?file=charts/generic/experiments.yaml -n litmus
    ```

### Step-3: Configure Sock-shop application and Litmus for the Kublr centralized monitoring Infrastructure

-   Deploy Litmus monitoring components

    ```
    kubectl -n litmus apply -f ../../utils/metrics-exporters/litmus-metrics/chaos-exporter/
    kubectl -n litmus apply -f ../../utils/metrics-exporters/litmus-metrics/litmus-event-router/
    ```

-   Enable Litmus metrics collection on the Litmus monitoring components

    ```

    kubectl annotate svc -n litmus --overwrite \
      chaos-monitor chaos-operator-metrics litmus-eventrouter \
      'prometheus.io/scrape=true'

-   Enable custom metrics collection on the Sock-shop application

    ```
    kubectl annotate svc -n sock-shop --overwrite \
      carts catalogue front-end orders payment shipping user \
      'prometheus.io/scrape=true'
    ```

-   Import the grafana dashboards choosing `prometheus` as data source.

    ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/platforms/kublr/grafana-dashboards/kubernetes/Sock-Shop-Performance-Under-Chaos.json)

- Import the grafana dashboard "Node and Pod Chaos Demo" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/platforms/kublr/grafana-dashboards/kubernetes/Node-and-pod-metrics-dashboard-kublr.json)

### Step-4: Execute the Chaos Experiments

-   For the sake of illustration, let us execute node and pod level, CPU hog experiments on the `catalogue` microservice & Memory Hog
    experiments on the `orders` microservice in a staggered manner.

    ```
    kubectl apply -f ../../utils/sample-chaos-injectors/chaos-experiments/catalogue/catalogue-pod-cpu-hog.yaml
    ```

    Wait for ~60s

    ```
    kubectl apply -f ../../utils/sample-chaos-injectors/chaos-experiments/orders/orders-pod-memory-hog.yaml
    ```

    Wait for ~60s

    ```
    kubectl apply -f ../../utils/sample-chaos-injectors/chaos-experiments/catalogue/catalogue-node-cpu-hog.yaml
    ```

    Wait for ~60s

    ```
    kubectl apply -f ../../utils/sample-chaos-injectors/chaos-experiments/orders/orders-node-memory-hog.yaml
    ```

-   Verify execution of chaos experiments

    ```
    kubectl describe chaosengine catalogue-pod-cpu-hog -n litmus
    kubectl describe chaosengine orders-pod-memory-hog -n litmus
    kubectl describe chaosengine catalogue-node-cpu-hog -n litmus
    kubectl describe chaosengine orders-node-memory-hog -n litmus
    ```

### Step-5: Visualize Chaos Impact

-   Observe the impact of chaos injection through increased Latency & reduced QPS (queries per second) on the microservices
    under test.

    ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Sock-Shop-Dashboard.png?raw=true)

    ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Node-and-Pod-metrics-Dashboard.png?raw=true)

### Step-6 (optional): Inject continous chaos using Argo CD.

-   Install Chaos workflow infrastructure.

    -   Create argo namespace

        ```
        kubectl create ns argo
        ```

    -   Create the CRDs, workflow controller deployment with associated RBAC.

        ```
        kubectl apply -f https://raw.githubusercontent.com/argoproj/argo/stable/manifests/install.yaml -n argo
        ```

    -   Install the argo CLI on the test harness machine (where the kubeconfig is available)

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

-   Create the Argo Access ServiceAccount

    ```
    kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/Argo/argo-access.yaml -n litmus
    ```

-   Run one or more of the litmuschaos experiments as Chaos workflows using argo CLI or kubectl.

    > Node CPU hog
    ```bash
    argo cron create ../../utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/catalogue/catalogue-node-cpu-hog-workflow.yaml -n litmus
    ```

    > Node memory hog
    ```bash
    argo cron create ../../utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/orders/orders-node-memory-hog-workflow.yaml -n litmus
    ```

    > Pod CPU hog

    ```bash
    kubectl apply -f ../../utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/catalogue/catalogue-pod-cpu-hog-workflow.yaml -n litmus
    ```

    > Pod memory hog
    ```bash
    kubectl apply -f ../../utils/sample-chaos-injectors/chaos-workflows-with-argo-CD/orders/orders-pod-memory-hog-workflow.yaml -n litmus
    ```

-   Visualize the Chaos cron workflow through argo UI by obtaining Node port or Load Balancer IP.

    ```
    kubectl port-forward svc/argo-server -n argo 2746
    ```

    OR

    ```
    kubectl patch svc argo-server -n argo -p '{"spec": {"type": "NodePort"}}'
    ```

    OR

    ```
    kubectl patch svc argo-server -n argo -p '{"spec": {"type": "LoadBalancer"}}'
    ```

    ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/chaos-workflow-representation.png?raw=true)

    ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/chaos-cron-workflows.png?raw=true)
