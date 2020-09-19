# Monitor Chaos on Sock-Shop

Chaos experiments on sock-shop app with grafana dashboard to monitor it. 

## Step-1: Obtain the demo artefacts

- Clone the litmus repo

  ```
  git clone https://github.com/litmuschaos/litmus.git
  cd litmus/demo/sample-applications/sock-shop
  ```


## Step-2: Setup Sock-Shop Microservices Application

- Create sock-shop namespace on the cluster

  ```
  kubectl create ns sock-shop
  ```

- Apply the sock-shop microservices manifests

  ```
  kubectl apply -f deployables/application-under-test/sock-shop/
  ```

- Wait until all services are up. Verify via `kubectl get pods -n sock-shop`


## Step-3: Setup the LitmusChaos Infrastructure

- Install the litmus chaos operator and CRDs 

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.8.0.yaml
  ```

- Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
  ```

- Install the chaos experiments in admin(litmus) namespace

  ```
  kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.8.0?file=charts/generic/experiments.yaml -n litmus  
  ```


## Step-4: Setup the Monitoring Infrastructure

  ```
  kubectl create ns monitoring
  ```

- Create the operator to instantiate all CRDs
  ```
  kubectl -n monitoring apply -f deployables/prometheus/prometheus-operator/
  ```

- Deploy monitoring components
  ```
  kubectl -n monitoring apply -f deployables/metrics-exporters-with-service-monitors/node-exporter/
  kubectl -n monitoring apply -f deployables/metrics-exporters-with-service-monitors/kube-state-metrics/
  kubectl -n monitoring apply -f deployables/alertmanager/
  kubectl -n sock-shop apply -f deployables/application-under-test/sock-shop-service-monitors/
  kubectl -n litmus apply -f deployables/metrics-exporters-with-service-monitors/litmus-metrics/chaos-exporter/
  kubectl -n litmus apply -f deployables/metrics-exporters-with-service-monitors/litmus-metrics/litmus-event-router/
  ```

- Deploy prometheus instance and all the service monitors for targets
  ```
  kubectl -n monitoring apply -f deployables/prometheus/prometheus-configuration/
  ```

- Apply the grafana manifests after deploying prometheus for all metrics.

  ```
  kubectl -n monitoring apply -f deployables/grafana/
  ```

- Access the grafana dashboard via the LoadBalancer (or NodePort) service IP or via a port-forward operation on localhost

  Note: To change the service type to NodePort, perform a `kubectl edit svc prometheus-k8s -n monitoring` and replace 
  `type: LoadBalancer` to `type: NodePort`

  ```
  kubectl get svc -n monitoring 
  ```

  Default username/password credentials: `admin/admin`

- Add the prometheus datasource from monitoring namespace as DS_PROMETHEUS for Grafana via the Grafana Settings menu

  ![image](https://user-images.githubusercontent.com/21166217/87426447-cbcf1c80-c5fc-11ea-976d-6a71ebac755a.png)

- Import the grafana dashboards

  ![image](https://user-images.githubusercontent.com/21166217/87426547-f28d5300-c5fc-11ea-95da-e091fb07f1b5.png)

- Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/monitoring-and-demo/demo/sample-applications/sock-shop/grafana-dashboards/sock-shop-performance-under-chaos.json)

- Import the grafana dashboard "Node and Pod Chaos Demo" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/monitoring-and-demo/demo/sample-applications/sock-shop/grafana-dashboards/node-and-pod-chaos.json)


## Step-5: Execute the Chaos Experiments


- For the sake of illustration, let us execute a CPU hog experiment on the `catalogue` microservice & a Memory Hog experiment on 
  the `orders` microservice in a staggered manner
 

  ```
  kubectl apply -f chaos-injectors/chaos-experiments/catalogue/catalogue-pod-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f chaos-injectors/chaos-experiments/orders/orders-pod-memory-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f chaos-injectors/chaos-experiments/catalogue/catalogue-node-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f chaos-injectors/chaos-experiments/orders/orders-node-memory-hog.yaml
  ```
  
- Verify execution of chaos experiments

  ```
  kubectl describe chaosengine catalogue-pod-cpu-hog -n litmus
  kubectl describe chaosengine orders-pod-memory-hog -n litmus
  kubectl describe chaosengine catalogue-node-cpu-hog -n litmus
  kubectl describe chaosengine orders-node-memory-hog -n litmus
  ```
  

## Step-6: Visualize Chaos Impact

- Observe the impact of chaos injection through increased Latency & reduced QPS (queries per second) on the microservices 
  under test. 

  ![image](https://user-images.githubusercontent.com/21166217/87426747-4d26af00-c5fd-11ea-8d82-dabf6bc9048a.png)

  ![image](https://user-images.githubusercontent.com/21166217/87426820-6cbdd780-c5fd-11ea-88de-1fe8a1b5b503.png)


## Step-7 (optional): Inject continous chaos using Argo CD.

- Install Argo workflow infrastructure.

  - Create argo namespace

    ```
    kubectl create ns argo
    ```

  - Create the CRDs, workflow controller deployment with associated RBAC.

    ```
    kubectl apply -f https://raw.githubusercontent.com/argoproj/argo/stable/manifests/install.yaml -n argo
    ```

  - Install the argo CLI on the test harness machine (where the kubeconfig is available)

    ```
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

  - Run litmuschaos experiments as Argo workflows.

    ```
    argo submit https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/Argo/argowf-native-pod-delete.yaml -n litmus
    ```

  - Visualize the Chaos Workflow

    ```
    kubectl patch svc argo-server -n argo -p '{"spec": {"type": "NodePort"}}'
    ```
    


