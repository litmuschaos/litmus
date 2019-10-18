## Experiment Metadata

| Type  | Description              | K8s Platform |
| ----- | ------------------------ | ------------ |
| Chaos | CPU -HOG                 |   ANY        | 

## Entry-Criteria

-  Application pods are healthy before chaos injection

## Exit-Criteria

-  Application pods are healthy post chaos injection

## Pre-Requisites

-  Custer should use docker container runtime

## Details

-  In this experiment, a CPU spike is given to a pod running on some node. The amount of CPU spike will be equal to the CPU capacity of the node on which the pod is scheduled.

## Associated Chaos Utils 

-  [gke/pod_cpu_consumption.yml](/chaoslib/litmus/platform/gke/pod_cpu_consumption.yml)
-  [gke/cpu-hog-daemonset.yml](/chaoslib/litmus/platform/gke/cpu-hog-daemonset.yml)

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |Type       |
| ------------- | ------------------------------------------------------------ |-----------|
| APP_NAMESPACE | Namespace in which application pods are deployed             |Mandatory  |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment|Mandatory  |
| APP_KIND      | Type of application `deployment`for deployment application   |Mandatory  |

### Chaos

| Parameter             | Description                                                  |Type      |
| ----------------------| ------------------------------------------------------------ |----------|
| PLATFORM              | The platform on with the chaos will work.                    |Mandatory |
| CHAOSENGINE           | ChaosEngine CR name associated with the experiment instance  |Mandatory |
| CHAOS_SERVICE_ACCOUNT	| Service account used by the pumba daemonset                  |Mandatory |
| TOTAL_CHAOS_DURATION  | Time duration for with the chaos will be injected            |Mandatory | 

## Procedure

-  Identify the values for the mandatory ENV variables
-  Create the chaos job via `kubectl create -f cpu_hog_k8s_job.yml`
-  Check result of the experiment via `kubectl describe chaosresult cpu_hog` (prefix chaosengine name to experiment name if applicable)
-  View experiment logs via `kubectl logs -f <chaos-pod-name>` 

