## Experiment Metadata

| Type  | Description              | K8s Platform |
| ----- | ------------------------ | ------------ |
| Chaos | Kill the application docker container | Any          |

## Entry-Criteria

- Application pods are healthy before chaos injection

## Exit-Criteria

- Application pods are healthy post chaos injection

## Pre-Requisites

- Cluster should use docker container runtime

## Details

- Executes SIGKILL on containers of random replicas of an application deployment
- Tests deployment sanity (replica availability & uninterrupted service) and recovery workflows of the application pod

## Associated Chaos Utils 

- [pumba/pod_failure_by_sigkill.yaml](/chaoslib/pumba/pod_failure_by_sigkill.yaml)

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| APP_NAMESPACE | Namespace in which application pods are deployed             |Mandatory
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |Mandatory
| TARGET_CONTAINER | Name of container which is subjected to kill |Mandatory

### Chaos

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| LIB     | The chaos lib used to inject the chaos |Mandatory
| CHAOSENGINE| ChaosEngine CR name associated with the experiment instance| Optional
| CHAOS_SERVICE_ACCOUNT	| Service account used by the pumba daemonset | Optional

## Procedure

- Identify the values for the mandatory ENV variables
- Create the chaos job via `kubectl create -f container_kill_k8s_job.yml`
- Check result of the experiment via `kubectl describe chaosresult container-kill` (prefix chaosengine name to experiment name if applicable)
- View experiment logs via `kubectl logs -f <chaos-pod-name>`

