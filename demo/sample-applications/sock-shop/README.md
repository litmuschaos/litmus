# Monitor Chaos on Sock-Shop

Chaos experiments on sock-shop app with grafana dashboard to monitor it. 

## Step-0: Obtain the demo artefacts

- Clone the sock-shop repo

  ```
  git clone https://github.com/ishangupta-ds/chaos-monitoring.git
  cd chaos-monitoring
  cd node_exporter_kube_state
  ```


## Step-1: Setup Sock-Shop Microservices Application

- Create sock-shop namespace on the cluster

  ```
  kubectl create ns sock-shop
  ```

- Apply the sock-shop microservices manifests

  ```
  kubectl apply -f sample-application/sock-shop/deploy/sock-shop/
  ```

- Wait until all services are up. Verify via `kubectl get pods -n sock-shop`


## Step-2: Setup the LitmusChaos Infrastructure

- Install the litmus chaos operator and CRDs 

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.7.0.yaml
  ```

- Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
  ```

- Install the chaos experiments in admin(litmus) namespace

  ```
  kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.7.0?file=charts/generic/experiments.yaml -n litmus  
  ```


## Step-3: Setup the Monitoring Infrastructure

  ```
  kubectl create ns monitoring
  ```

- Create the operator to instantiate all CRDs
  ```
  kubectl -n monitoring apply -f deploy/prometheus-operator/
  ```

- Deploy monitoring components
  ```
  kubectl -n monitoring apply -f deploy/node-exporter/
  kubectl -n monitoring apply -f deploy/kube-state-metrics/
  kubectl -n monitoring apply -f deploy/alertmanager/
  kubectl -n sock-shop apply -f deploy/sock-shop-service-mon/
  kubectl -n litmus apply -f deploy/chaos-exporter/
  kubectl -n litmus apply -f deploy/litmus-event-router/
  ```

- Deploy prometheus instance and all the service monitors for targets
  ```
  kubectl -n monitoring apply -f deploy/prometheus-cluster-monitoring/
  ```

- Apply the grafana manifests after deploying prometheus for all metrics.

  ```
  kubectl -n monitoring apply -f sample-application/sock-shop/deploy/monitoring/
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
  kubectl apply -f sample-application/sock-shop/chaos/catalogue/catalogue-pod-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f sample-application/sock-shop/chaos/orders/orders-pod-memory-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f sample-application/sock-shop/chaos/catalogue/catalogue-node-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f sample-application/sock-shop/chaos/orders/orders-node-memory-hog.yaml
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


