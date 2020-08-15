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
  kubectl apply -f deploy/sock-shop/
  ```

- Wait until all services are up. Verify via `kubectl get pods -n sock-shop`

## Step-2: Setup the LitmusChaos Infrastructure

- Install the litmus chaos operator and CRDs 

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.6.1.yaml
  ```

- Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
  ```

- Install the chaos experiments in admin(litmus) namespace

  ```
  kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.6.1?file=charts/generic/experiments.yaml -n litmus 
  ```

- Install the chaos experiment metrics exporter and chaos event exporter

  ```
  kubectl apply -f deploy/litmus-metrics/01-event-router-cm.yaml
  kubectl apply -f deploy/litmus-metrics/02-event-router.yaml
  kubectl apply -f deploy/litmus-metrics/03-chaos-exporter.yaml
  ```

## Step-3: Setup the Monitoring Infrastructure

- Apply the monitoring manifests in specified order

  ```
  kubectl apply -f deploy/monitoring/01-monitoring-ns.yaml
  kubectl apply -f deploy/monitoring/02-prometheus-rbac.yaml
  kubectl apply -f deploy/monitoring/03-prometheus-configmap.yaml
  kubectl apply -f deploy/monitoring/04-prometheus-alert-rules.yaml
  kubectl apply -f deploy/monitoring/05-prometheus-deployment.yaml
  kubectl apply -f deploy/monitoring/06-prometheus-svc.yaml
  kubectl apply -f deploy/monitoring/07-grafana-deployment.yaml
  kubectl apply -f deploy/monitoring/08-grafana-svc.yaml
  ```

- Access the grafana dashboard via the NodePort (or loadbalancer) service IP or via a port-forward operation on localhost

  Note: To change the service type to Loadbalancer, perform a `kubectl edit svc prometheus -n monitoring` and replace 
  `type: NodePort` to `type: LoadBalancer`

  ```
  kubectl get svc -n monitoring 
  ```

  Default username/password credentials: `admin/admin`

- Add the prometheus datasource for Grafana via the Grafana Settings menu

  ![image](https://user-images.githubusercontent.com/21166217/87426447-cbcf1c80-c5fc-11ea-976d-6a71ebac755a.png)

- Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/demo/sample-applications/sock-shop/deploy/monitoring/10-grafana-dashboard.json)

  ![image](https://user-images.githubusercontent.com/21166217/87426547-f28d5300-c5fc-11ea-95da-e091fb07f1b5.png)

## Step-4: Execute the Chaos Experiments


- For the sake of illustration, let us execute a CPU hog experiment on the `catalogue` microservice & a Memory Hog experiment on 
  the `orders` microservice in a staggered manner
 

  ```
  kubectl apply -f chaos/catalogue/catalogue-cpu-hog.yaml
  ```

  Wait for ~60s

  ```
  kubectl apply -f chaos/orders/orders-memory-hog.yaml
  ```
  
- Verify execution of chaos experiments

  ```
  kubectl describe chaosengine catalogue-cpu-hog -n litmus
  kubectl describe chaosengine orders-memory-hog -n litmus
  ```
  
## Step-5: Visualize Chaos Impact

- Observe the impact of chaos injection through increased Latency & reduced QPS (queries per second) on the microservices 
  under test. 

  ![image](https://user-images.githubusercontent.com/21166217/87426747-4d26af00-c5fd-11ea-8d82-dabf6bc9048a.png)

  ![image](https://user-images.githubusercontent.com/21166217/87426820-6cbdd780-c5fd-11ea-88de-1fe8a1b5b503.png)

