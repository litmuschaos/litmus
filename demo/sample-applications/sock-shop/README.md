# Monitor Chaos on Sock-Shop

Chaos experiments on sock-shop app with grafana dashboard to monitor it. 

## Step-0: Obtain the demo artefacts

- Clone the litmus repo

  ```
  git clone https://github.com/litmuschaos/litmus.git
  cd litmus/demo/sample-applications/sock-shop
  ```


## Step-1: Setup Sock-Shop Microservices Application

- Create sock-shop namespace on the cluster

  ```
  kubectl create ns sock-shop
  ```

- Apply the sock-shop microservices manifests

  ```
  kubectl apply -f deployables/application-under-test/sock-shop/
  ```

- Wait until all services are up. Verify via `kubectl get pods -n sock-shop`


## Step-2: Setup the LitmusChaos Infrastructure

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


## Step-3: Setup the Monitoring Infrastructure

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

- Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/ishangupta-ds/chaos-monitoring/master/node_exporter_kube_state/grafana-dashboards/sock-shop-performance.json)

- Import the grafana dashboard "Node and Pod Chaos Demo" provided [here](https://raw.githubusercontent.com/ishangupta-ds/chaos-monitoring/master/node_exporter_kube_state/grafana-dashboards/node-and-pod-chaos-demo.json)


## Step-4: Execute the Chaos Experiments


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
  

## Step-5: Visualize Chaos Impact

- Observe the impact of chaos injection through increased Latency & reduced QPS (queries per second) on the microservices 
  under test. 


