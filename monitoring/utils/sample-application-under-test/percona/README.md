# Demonstration

## Monitor Chaos on Percona

Run chaos experiments on percona application with grafana dashboard to monitor it.

### Step-1: Setup Percona Application


- Setup Percona.

  ```
  kubectl apply -f ../../../utils/sample-application-under-test/percona/deploy/crd.yaml
  ```

  ```
  kubectl create namespace pxc
  ```

  ```
  kubectl -n pxc apply -f ../../../utils/sample-application-under-test/percona/deploy/rbac.yaml
  ```

  ```
  kubectl -n pxc apply -f ../../../utils/sample-application-under-test/percona/deploy/operator.yaml
  ```

  ```
  kubectl -n pxc apply -f ../../../utils/sample-application-under-test/percona/deploy/secrets.yaml
  ```


- (optional-PMM) Setup PMM for Percona

  ```
  helm repo add percona https://percona-charts.storage.googleapis.com
  ```

  ```
  helm repo update
  ```

  ```
  helm install monitoring percona/pmm-server --set platform=kubernetes --version 2.7.0 --set "credentials.password=newpass"
  ```


- Wait until all services are up. Verify via `kubectl get pods -n pxc`



- (optional-PMM) Check for logs and monitoring service

  ```
  kubectl logs -f cluster1-pxc-0 -c pmm-client
  ```

  ```
  kubectl get service/monitoring-service -o wide
  ```


- Apply the CR
  
  ```
  kubectl -n pxc apply -f ../../../utils/sample-application-under-test/percona/deploy/cr.yaml
  ```

- To Check connectivity to newly created cluster

  ```
  kubectl run -i --rm --tty percona-client --image=percona:8.0 --restart=Never -- bash -il percona-client:/$ mysql -h cluster1-haproxy -uroot -proot_password
  ```

### Step-2: Setup the LitmusChaos Infrastructure

- Install the litmus chaos operator and CRDs

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.12.0.yaml
  ```

- Install the litmus-admin serviceaccount for centralized/admin-mode of chaos execution

  ```
  kubectl apply -f https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml
  ```

- Install the chaos experiments in admin(litmus) namespace

  ```
  kubectl apply -f https://hub.litmuschaos.io/api/chaos/1.12.0?file=charts/generic/experiments.yaml -n litmus
  ```

### Step-3: Setup the Monitoring Infrastructure

- Create monitoring namespace on the cluster

  ```
  kubectl create ns monitoring
  ```

- Setup prometheus TSDB
  
  > Model-1 (optional): Service monitor and prometheus operator model.(Using mySQLd exporter for percona SQL metrics)

    Create the operator to instantiate all CRDs

    ```
    kubectl -n monitoring apply -f utils/prometheus/prometheus-operator/
    ```

    Deploy monitoring components

    ```
    kubectl -n litmus apply -f ../../../utils/metrics-exporters-with-service-monitors/litmus-metrics/chaos-exporter/
    kubectl -n monitoring apply -f ../../../utils/metrics-exporters-with-service-monitors/mysqld-exporter/
    ```   

    Deploy prometheus instance and all the service monitors for targets

    ```
    kubectl -n monitoring apply -f ../../../utils/prometheus/prometheus-configuration/
    ```

    Note: To change the service type to NodePort, perform a `kubectl edit svc prometheus-k8s -n monitoring` and replace `type: LoadBalancer` to `type: NodePort`


  > Model-2 (optional): Prometheus scrape config model.(Using pmm server for all percona metrics)

    Deploy prometheus components

    ```
    kubectl -n monitoring apply -f ../../../utils/prometheus/prometheus-scrape-configuration/
    ```

    Deploy metrics exporters

    ```
    kubectl -n litmus apply -f ../../../utils/metrics-exporters/litmus-metrics/chaos-exporter/
    ```

- (if not using PMM) Apply the grafana manifests after deploying prometheus for all metrics.

  ```
  kubectl -n monitoring apply -f ../../../utils/grafana/
  ```

- (if not using PMM) You may access the grafana dashboard via the LoadBalancer (or NodePort) service IP or via a port-forward operation on localhost

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

- (optional) Import the grafana dashboard "Sock-Shop Performance" provided [here](https://raw.githubusercontent.com/ishangupta-ds/litmus/percona/monitoring/grafana-dashboards/percona-sql/db.json)

- (optional) Use PMM for monitoring.

### Step-4: Execute the Chaos Experiments

```
kubectl apply -f ../../../utils/sample-chaos-injectors/chaos-experiments/percona/percona-network-loss.yaml
```


- Verify execution of chaos experiments

  ```
  kubectl describe chaosengine percona-network-chaos -n litmus
  ```

### Step-5: Visualize Chaos Impact