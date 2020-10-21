# Getting Started
## Litmus
- Refer to the LitmusChaos [documentation](https://docs.litmuschaos.io) to get started on installing Litmus infra on your
Kubernetes clusters. In this example, we will use the [admin mode](https://docs.litmuschaos.io/docs/admin-mode/) of execution where
all chaos resources will be created in the centralized namespace, litmus.
## Argo Workflows
The Argo workflow infra consists of the Argo workflow CRDs, Workflow Controller, associated RBAC & Argo CLI. The steps
shown below installs argo in the standard cluster-wide mode wherein the workflow controller operates on all
namespaces. Ensure that you have the right permission to be able to create the said resources.

If you would like to run argo with a namespace scope, refer to [this](https://github.com/argoproj/argo/blob/master/manifests/namespace-install.yaml) manifest.

- Create argo namespace
  ```
  root@demo:~/chaos-workflows# kubectl create ns argo
  ```
- Create the CRDs, workflow controller deployment with associated RBAC
  ```
  root@demo:~/chaos-workflows# kubectl apply -f https://raw.githubusercontent.com/argoproj/argo/stable/manifests/install.yaml
  ```
- Verify successful creation of argo resources (crds)
  ```
  root@demo:~/chaos-workflows# kubectl get crds | grep argo
  clusterworkflowtemplates.argoproj.io                         2020-05-15T03:01:31Z
  cronworkflows.argoproj.io                                    2020-05-15T03:01:31Z
  workflows.argoproj.io                                        2020-05-15T03:01:31Z
  workflowtemplates.argoproj.io                                2020-05-15T03:01:31Z
  ```
- Verify successful creation of argo resources (api-ressources)
  ```
  root@demo:~/chaos-workflows# kubectl api-resources | grep argo
  clusterworkflowtemplates          clusterwftmpl,cwft   argoproj.io                              false        ClusterWorkflowTemplate
  cronworkflows                     cronwf,cwf           argoproj.io                              true         CronWorkflow
  workflows                         wf                   argoproj.io                              true         Workflow
  workflowtemplates                 wftmpl               argoproj.io                              true         WorkflowTemplate
  ```
- Verify successful creation of argo server and workflow
  ```
  root@demo:~/chaos-workflows# kubectl get pods -n argo
  NAME                                   READY   STATUS    RESTARTS   AGE
  argo-server-65cbb4874c-cbq2h           1/1     Running   0          20s
  workflow-controller-55bffbdbfd-c4jdf   1/1     Running   0          20s
  ```
- Install the argo CLI on the harness/test machine (where the kubeconfig is available)
  ```
  root@demo:~# curl -sLO https://github.com/argoproj/argo/releases/download/v2.8.0/argo-linux-amd64
  root@demo:~# chmod +x argo-linux-amd64
  root@demo:~# mv ./argo-linux-amd64 /usr/local/bin/argo
  root@demo:~# argo version
  argo: v2.8.0
  BuildDate: 2020-05-11T22:55:16Z
  GitCommit: 8f696174746ed01b9bf1941ad03da62d312df641
  GitTreeState: clean
  GitTag: v2.8.0
  GoVersion: go1.13.4
  Compiler: gc
  Platform: linux/amd64
  ```
## Application
- Install a simple multi-replica stateless nginx deployment with service exposed over nodeport
  ```
  root@demo:~# kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/App/nginx.yaml
  ```
  ```
  root@demo:~# kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/App/service.yaml
  ```
  ```
  root@demo:~# kubectl get pods -w
  ```
- You can access this service over `https://<node-ip>:<nodeport>`
## Chaos Experiment
- Setup the Chaos Experiment for your namespace
```
  root@demo:~/chaos-workflows# kubectl apply -f ChaosExperiment/experiments-k8.yaml
  ```
## Chaos Execution
###  Admin Mode
- Setup the RBAC to execute chaos experiment in your namespace
```
  root@demo:~/chaos-workflows# kubectl apply -f ChaosExecution/rbac-chaos-admin.yaml
  ```
- Execute the Chaos Experiment in your namespace
```
  root@demo:~/chaos-workflows# kubectl apply -f ChaosExperiment/engine-nginx-count-admin.yaml
  ```
### Service Mode
- Setup the RBAC to execute chaos experiment in your namespace
```
  root@demo:~/chaos-workflows# kubectl apply -f ChaosExecution/rbac-chaos-service.yaml
  ```
- Execute the Chaos Experiment in your namespace
```
  root@demo:~/chaos-workflows# kubectl apply -f ChaosExperiment/engine-nginx-count-service.yaml
  ```
## Chaos Workflow - Argo Workflow
- Setup the RBAC for executing Argo Workflow
```
  root@demo:~/chaos-workflows# kubectl apply -f Argo/rbac-argo-service.yaml
  ```
###  Admin Mode
- Execute the Chaos Experiment via Argo Workflow
```
  root@demo:~/chaos-workflows# kubectl apply -f Argo/argowf-chaos-admin.yaml
  ```
###  Service Mode
- Execute the Chaos Experiment via Argo Workflow
```
  root@demo:~/chaos-workflows# kubectl apply -f Argo/argowf-chaos-service.yaml
  ```
## Perf WorkFlow - Argo workflow on NGINX Application
- Execute the Performance Test via Argo Workflow
```
  root@demo:~/chaos-workflows# kubectl apply -f Argo/argowf-perf.yaml
  ```
## Chaos with Performance testing - Argo Workflow
- Execute the Chaos Experiment with Performance Test via Argo Workflow
###  Admin Mode
- Execute the Chaos Experiment via Argo Workflow
```
  root@demo:~/chaos-workflows# kubectl apply -f Argo/argowf-perf-chaos-admin.yaml
  ```
###  Service Mode
- Execute the Chaos Experiment via Argo Workflow
```
  root@demo:~/chaos-workflows# kubectl apply -f Argo/argowf-perf-chaos-service.yaml
  ```
