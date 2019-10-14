## Experiment Metadata

| Type  | Description              | K8s Platform |
| ----- | ------------------------ | ------------ |
| Chaos | Fail the application pod | Any          |

## Entry-Criteria

- Application pods are healthy before chaos injection

## Exit-Criteria

- Application pods are healthy post chaos injection

## Details

- Causes (forced/graceful) pod failure of random replicas of an application deployment
- Tests deployment sanity (replica availability & uninterrupted service) and recovery workflows of the application pod

## Integrations

- Pod failures can be effected using one of these chaos libraries: `litmus`, `powerfulseal`
- The desired chaoslib can be selected by setting one of the above options as value for the env variable `LIB`

## Associated Chaos Utils 

- litmuslib
  - [litmus/pod_failure_by_litmus.yml](/chaoslib/litmus/pod_failure_by_litmus.yml)
  - [litmus/kill_random_pod.yml](/chaoslib/litmus/kill_random_pod.yml)
- powerfulseal
  - [powerfulseal/pod_failure_by_powerfulseal.yml](/chaoslib/powerfulseal/pod_failure_by_powerfulseal.yml)

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| APP_NAMESPACE | Namespace in which application pods are deployed             |Mandatory
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |Mandatory

### Chaos

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| TOTAL_CHAOS_DURATION |The time duration for chaos insertion (sec)             |Mandatory
| CHAOS_INTERVAL     | Time interval b/w two successive pod-failures (sec)|Mandatory
| LIB     | The chaos lib used to inject the chaos |Mandatory
| CHAOSENGINE| ChaosEngine CR name associated with the experiment instance| Optional
| CHAOS_SERVICE_ACCOUNT	| Service account used by the powerfulseal deployment | Optional

## Procedure

- Identify the values for the mandatory ENV variables
- Create the chaos job via `kubectl create -f pod_delete_k8s_job.yml`
- Check result of the experiment via `kubectl describe chaosresult pod-delete` (prefix chaosengine name to experiment name if applicable)
- View experiment logs via `kubectl logs -f <chaos-pod-name>`

