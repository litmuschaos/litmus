## Experiment Metadata

| Type  | Description                        | K8s Platform |
| ----- | ---------------------------------- | ------------ |
| Chaos | Fillup Ephemeral Storage of a Pod  | Any          |

## Entry-Criteria

- Application pods are healthy before chaos injection.

## Exit-Criteria

- Application pods are healthy post chaos injection.

## Details

- Causes Disk Stress by filling up the Ephemeral Storage of the Pod using one of it containers.
- Causes Pod to get Evicted if the Pod exceeds it Ephemeral Storage Limit.
- Tests the Ephemeral Storage Limits, to ensure those parameters are sufficient.

## Integrations

- Disk Fill can be effected using one of these chaos libraries: `litmus`.
- The desired chaoslib can be selected by setting the above options as value for the env variable `LIB`

## Associated Chaos Utils 

- litmuslib
  - [litmus/disk_fill_by_litmus.yml](/chaoslib/litmus/disk_fill_by_litmus.yml)
  - [experiments/generic/disk_fill/disk_fill_ds.yml](/experiments/generic/disk_fill/disk_fill_ds.yml)

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                   |Type|
| ------------- | ------------------------------------------------------------- |----
| APP_NAMESPACE | Namespace in which application pods are deployed              |Mandatory
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |Mandatory

### Chaos

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| TOTAL_CHAOS_DURATION |The time duration for chaos insertion (sec)             |Mandatory
| LIB     | The chaos lib used to inject the chaos |Mandatory
| CHAOSENGINE| ChaosEngine CR name associated with the experiment instance| Optional
| CHAOS_SERVICE_ACCOUNT	| Service account used by the powerfulseal deployment | Optional
| FILL_PERCENTAGE | Percentage to fill the Ephemeral storage limit | Mandatory

## Procedure

- Identify the values for the mandatory ENV variables
- Create the chaos job via `kubectl create -f disk_fill_k8s_job.yml`
- Check result of the experiment via `kubectl describe chaosresult disk-fill:x
` (prefix chaosengine name to experiment name if applicable)
- View experiment logs via `kubectl logs -f <chaos-pod-name>`

## Limitations

- Need Kubernetes Version > 1.13