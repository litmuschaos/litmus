# Demonstration

## Monitor Chaos on Percona

Run chaos experiments on percona application with grafana dashboard to monitor it.

### Setup Percona Application

- Setup Percona.

  ```
  kubectl apply -f ../../sample-application-under-test/percona/crd.yaml
  ```

  ```
  kubectl create namespace pxc
  ```

  ```
  kubectl -n pxc apply -f ../../sample-application-under-test/percona/rbac.yaml
  ```

  ```
  kubectl -n pxc apply -f ../../sample-application-under-test/percona/operator.yaml
  ```

  ```
  kubectl -n pxc apply -f ../../sample-application-under-test/percona/secrets.yaml
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

- Apply the CR with pmm:enabled: true OR false

  ```
  kubectl -n pxc apply -f ../../sample-application-under-test/percona/cr.yaml
  ```

- To Check connectivity to newly created cluster for PMM

  ```
  kubectl run -i --rm --tty percona-client --image=percona:8.0 --restart=Never -- bash -il percona-client:/$ mysql -h cluster1-haproxy -uroot -proot_password
  ```

### Setup the Monitoring Infrastructure (if not using PMM)

- Create monitoring namespace on the cluster

  ```
  kubectl create ns monitoring
  ```

- Setup prometheus TSDB (Using mySQLd exporter for percona SQL metrics)

  ```
  kubectl create ns monitoring
  ```

  > Model-1 (optional): Service monitor and prometheus operator model.

      Create the operator to instantiate all CRDs

      ```
      kubectl -n monitoring apply -f ../../prometheus/prometheus-operator/
      ```

      Deploy monitoring components

      ```
      kubectl -n litmus apply -f ../../metrics-exporters-with-service-monitors/litmus-metrics/chaos-exporter/
      kubectl -n monitoring apply -f ../../metrics-exporters-with-service-monitors/mysqld-exporter/
      ```

      Deploy prometheus instance and all the service monitors for targets

      ```
      kubectl -n monitoring apply -f ../../prometheus/prometheus-configuration/
      ```

      Note: To change the service type to NodePort, perform a `kubectl edit svc prometheus-k8s -n monitoring` and replace `type: LoadBalancer` to `type: NodePort`

  > Model-2 (optional): Prometheus scrape config model.

      Deploy prometheus components

      ```
      kubectl -n monitoring apply -f ../../prometheus/prometheus-scrape-configuration/
      ```

      Deploy metrics exporters

      ```
      kubectl -n litmus apply -f ../../metrics-exporters/litmus-metrics/chaos-exporter/
      kubectl -n monitoring apply -f ../../metrics-exporters/mysqld-exporter/
      ```

- Apply the grafana manifests after deploying prometheus for all metrics.

  ```
  kubectl -n monitoring apply -f ../../grafana/
  ```

- You may access the grafana dashboard via the LoadBalancer (or NodePort) service IP or via a port-forward operation on localhost

  View the services running in the monitoring namespace

  ```
  kubectl get svc -n monitoring
  ```

  Now copy the EXTERNAL-IP of grafana and view it in the browser

  Default username/password credentials: `admin/admin`

### Configure the Monitoring Infrastructure

- Add the prometheus datasource from monitoring namespace as DS_PROMETHEUS for Grafana via the Grafana Settings menu for PMM

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/data-source-config.png?raw=true)

- Import the grafana dashboards

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- (optional) Import the grafana dashboard "MySQL Overview" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/percona-sql/MySQL-Overview-Interleaved.json)

- (optional) Import the grafana dashboard "PXC Galera Node summary Performance" provided [here](https://raw.githubusercontent.com/litmuschaos/litmus/master/monitoring/grafana-dashboards/percona-sql/PXC_Galera_Node_Summary_Interleaved.json)

- (optional) Use PMM for monitoring.

### Execute the Chaos Experiments

```
kubectl apply -f ../../sample-chaos-injectors/chaos-experiments/percona/percona-network-loss.yaml
```

- Verify execution of chaos experiments

  ```
  kubectl describe chaosengine percona-network-chaos -n litmus
  ```

### Visualize Chaos Impact

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/mySQL-Overview-1.png?raw=true)

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/mySQL-Overview-2.png?raw=true)

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Galera-Node-Summary-1.png?raw=true)

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Galera-Node-Summary-2.png?raw=true)
