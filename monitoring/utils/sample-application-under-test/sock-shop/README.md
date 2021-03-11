# Demonstration

## Monitor Chaos on Sock-Shop

Run chaos experiments and workflows on sock-shop application with grafana dashboard to monitor it.

### Setup Sock-Shop Microservices Application

- Apply the sock-shop microservices manifests

  ```
  kubectl apply -f .
  ```

- Wait until all services are up. Verify via `kubectl get pods -n sock-shop`

### Setup the Monitoring Components

- create service monitors for all the application services if using prometheus operator with service monitors.

  ```
  kubectl -n sock-shop apply -f ../../sample-application-service-monitors/sock-shop/
  ```

### Import the grafana dashboard

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/sock-shop/Sock-Shop-Performance-Under-Chaos.json)

### Execute the Chaos Experiments

- For the sake of illustration, let us execute node and pod level, CPU hog experiments on the `catalogue` microservice & Memory Hog experiments on the `orders` microservice in a staggered manner.

  ```
  kubectl apply -f ../../sample-chaos-injectors/chaos-experiments/catalogue/catalogue-pod-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f ../../sample-chaos-injectors/chaos-experiments/orders/orders-pod-memory-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f ../../sample-chaos-injectors/chaos-experiments/catalogue/catalogue-node-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f ../../sample-chaos-injectors/chaos-experiments/orders/orders-node-memory-hog.yaml
  ```

- Verify execution of chaos experiments

  ```
  kubectl describe chaosengine catalogue-pod-cpu-hog -n litmus
  kubectl describe chaosengine orders-pod-memory-hog -n litmus
  kubectl describe chaosengine catalogue-node-cpu-hog -n litmus
  kubectl describe chaosengine orders-node-memory-hog -n litmus
  ```

### Visualize Chaos Impact

- Observe the impact of chaos injection through increased Latency & reduced QPS (queries per second) on the microservices
  under test.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Sock-Shop-Dashboard.png?raw=true)

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Node-and-Pod-metrics-Dashboard.png?raw=true)

### Inject continous chaos using Argo CD.

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
  argo cron create ../../sample-chaos-injectors/chaos-workflows-with-argo-CD/catalogue/catalogue-node-cpu-hog-workflow.yaml -n litmus
  ```

  > Node memory hog

  ```bash
  argo cron create ../../sample-chaos-injectors/chaos-workflows-with-argo-CD/orders/orders-node-memory-hog-workflow.yaml -n litmus
  ```

  > Pod CPU hog

  ```bash
  kubectl apply -f ../../sample-chaos-injectors/chaos-workflows-with-argo-CD/catalogue/catalogue-pod-cpu-hog-workflow.yaml -n litmus
  ```

  > Pod memory hog

  ```bash
  kubectl apply -f ../../sample-chaos-injectors/chaos-workflows-with-argo-CD/orders/orders-pod-memory-hog-workflow.yaml -n litmus
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
