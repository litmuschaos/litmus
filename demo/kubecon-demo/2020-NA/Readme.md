# Getting Started
## Litmus
- Refer to the LitmusChaos [documentation](https://docs.litmuschaos.io) to get started on installing Litmus infra on your
Kubernetes clusters. All chaos resources will be created in the centralized namespace from below manifest, litmus.
- Apply the LitmusChaos Operator manifest
```
 2020-NA git:(kubecon-2020)kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.9.0.yaml
```
- Verify if the ChaosOperator is running
```
2020-NA git:(kubecon-2020) ✗ kubectl get pods -n litmus
NAME                                 READY   STATUS    RESTARTS   AGE
chaos-operator-ce-658b7dfc7b-4nw45   1/1     Running   0          11d
```
- verify the CRD's
```
2020-NA git:(kubecon-2020) ✗ kubectl get crds | grep chaos
chaosengines.litmuschaos.io                   2020-06-11T17:59:33Z
chaosexperiments.litmuschaos.io               2020-06-11T17:59:33Z
chaosresults.litmuschaos.io                   2020-06-11T17:59:34Z
```
- Verify the api-resources
```
2020-NA git:(kubecon-2020) ✗ kubectl api-resources | grep chaos
chaosengines                                           litmuschaos.io                 true         ChaosEngine
chaosexperiments                                       litmuschaos.io                 true         ChaosExperiment
chaosresults                                           litmuschaos.io                 true         ChaosResult
```
## Argo Workflows
The Argo workflow infra consists of the Argo workflow CRDs, Workflow Controller, associated RBAC & Argo CLI. The steps
shown below installs argo in the standard cluster-wide mode wherein the workflow controller operates on all
namespaces. Ensure that you have the right permission to be able to create the said resources.

If you would like to run argo with a namespace scope, refer to [this](https://github.com/argoproj/argo/blob/master/manifests/namespace-install.yaml) manifest.

- Create argo namespace
  ```
  ➜  2020-NA git:(kubecon-2020) ✗ kubectl create ns argo
  ```
- Create the CRDs, workflow controller deployment with associated RBAC
  ```
  ➜  2020-NA git:(kubecon-2020) ✗ kubectl apply -f https://raw.githubusercontent.com/argoproj/argo/stable/manifests/install.yaml
  ```
- Verify successful creation of argo resources (crds)
```
2020-NA git:(kubecon-2020) ✗ kubectl get crds | grep argo
clusterworkflowtemplates.argoproj.io          2020-05-14T04:57:16Z
cronworkflows.argoproj.io                     2020-05-14T04:57:18Z
workflows.argoproj.io                         2020-05-14T04:57:20Z
workflowtemplates.argoproj.io                 2020-05-14T04:57:21Z
```
- Verify successful creation of argo resources (api-resources)
```
2020-NA git:(kubecon-2020) ✗ kubectl api-resources | grep argo
clusterworkflowtemplates          clusterwftmpl,cwft   argoproj.io                    false        ClusterWorkflowTemplate
cronworkflows                     cwf,cronwf           argoproj.io                    true         CronWorkflow
workflows                         wf                   argoproj.io                    true         Workflow
workflowtemplates                 wftmpl               argoproj.io                    true         WorkflowTemplate
```
- Verify successful creation of argo server and workflow
```
2020-NA git:(kubecon-2020) ✗  kubectl get pods -n argo
NAME                                   READY   STATUS    RESTARTS   AGE
argo-server-78b774dd56-j8xwx           1/1     Running   0          13h
workflow-controller-589bf468d7-bwjtr   1/1     Running   0          13h
```
- Install the argo CLI on the harness/test machine (where the kubeconfig is available)
```
2020-NA git:(kubecon-2020) curl -sLO https://github.com/argoproj/argo/releases/download/v2.8.0/argo-linux-amd64
2020-NA git:(kubecon-2020) chmod +x argo-linux-amd64
2020-NA git:(kubecon-2020) mv ./argo-linux-amd64 /usr/local/bin/argo
2020-NA git:(kubecon-2020) argo version
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
- Create a namespace for chaos experiment as chaos-ns
```
  ➜  2020-NA git:(kubecon-2020) ✗ kubectl create ns chaos-ns
```
- Install a simple multi-replica stateless nginx deployment with service exposed over nodeport
```
➜  App git:(kubecon-2020) ✗ kubectl  apply -f nginx_demo.yaml
deployment.apps/nginx-demo-app created
service/nginx-demo-app-svc created
  ```
  ```
App git:(kubecon-2020) ✗ kubectl get pods -l app=nginx-demo-app  -w
NAME                              READY   STATUS    RESTARTS   AGE
nginx-demo-app-68c58bb7d7-fg2bc   1/1     Running   0          94s
nginx-demo-app-68c58bb7d7-jfrrr   1/1     Running   0          94s
nginx-demo-app-68c58bb7d7-s98wz   1/1     Running   0          94s
  ```
- You can access this service over `https://<node-ip>:<nodeport>`
## Chaos Experiment
- Setup the Chaos Experiment for your namespace
```
 2020-NA git:(kubecon-2020) ✗ kubectl apply -f ChaosExperiment/experiments-k8.yaml
chaosexperiment.litmuschaos.io/k8-pod-delete created
```
```
➜  2020-NA git:(kubecon-2020) ✗ k get chaosexperiments
NAME            AGE
k8-pod-delete   4s
  ```
## Chaos Execution
- Setup the RBAC to execute chaos experiment in your namespace
```
➜  2020-NA git:(kubecon-2020) ✗ kubectl apply -f ChaosExecution/rbac-chaos-admin.yaml
serviceaccount/chaos-admin created
clusterrole.rbac.authorization.k8s.io/chaos-admin configured
clusterrolebinding.rbac.authorization.k8s.io/chaos-admin configured
  ```
- Execute the Chaos Experiment in your namespace
```
  ➜  2020-NA git:(kubecon-2020) ✗ kubectl apply -f ChaosExecution/engine-nginx-count-admin.yaml
  ```
## Chaos Workflow - Argo Workflow
- Execute the Chaos Experiment via Argo Workflow
```
  ➜  2020-NA git:(kubecon-2020) ✗ argo submit Argo/argowf-chaos-admin.yaml --watch
  ```
## Perf WorkFlow - Argo workflow on NGINX Application
- Execute the Performance Test via Argo Workflow
```
  ➜  2020-NA git:(kubecon-2020) ✗ argo submit Argo/argowf-perf.yaml --watch
  ```
## Chaos with Performance testing - Argo Workflow
- Execute the Chaos Experiment with Performance Test via Argo Workflow
```
  ➜  2020-NA git:(kubecon-2020) ✗ argo submit Argo/argowf-perf-chaos-admin.yaml --watch
  ```
