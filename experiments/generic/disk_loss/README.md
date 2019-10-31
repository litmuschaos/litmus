## Experiment Metadata

| Type  | Description              | K8s Platform |
| ----- | ------------------------ | ------------ |
| Chaos | External Disk loss from the node  | GKE/AWS      |

## Entry-Criteria

- The disk is healthy before chaos injection

## Exit-Criteria

- The disk is healthy post chaos injection

## Details

- In this experiment, the external disk is detached from the node and wait for the chaos duration for automatically attached. If it failed to attach manually. It will be attached manually.
- This chaos experiment is in beta state.

## Associated Chaos Utils 

- litmuslib
  - [litmus/disk_losss.yml](/chaoslib/litmus/platform/gke/disk_loss.yml)

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| APP_CHECK | If it checks to true, the experiment will check the status of the application.             |Optional
| APP_NAMESPACE | Namespace in which application pods are deployed             |Optional
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |Optional

### Chaos

| Parameter     | Description                                                  |Type|
| ------------- | ------------------------------------------------------------ |----
| TOTAL_CHAOS_DURATION |The time duration for chaos insertion (sec)             |Mandatory
| CHAOS_NAMESPACE | This is a chaos namespace which will create all infra chaos resources in that namespace | Mandatory
| CLOUD_NAMESPACE | Cloud Platform name | Mandatory
| PROJECT_ID     | GCP project ID|Mandatory
| NODE_NAME     | Node name |Mandatory
| DISK_NAME     | Disk Name|Mandatory
| ZONE_NAME     | Zone Name|Mandatory
| CHAOSENGINE| ChaosEngine CR name associated with the experiment instance| Optional
| CHAOS_SERVICE_ACCOUNT    | Service account used by the powerfulseal deployment | Optional

## Procedure

- Identify the values for the mandatory ENV variables
- Create the chaos job via `kubectl create -f disk_loss_k8s_job.yml`
- Check the result of the experiment via `kubectl describe chaosresult disk_loss` (prefix chaosengine name to experiment name if applicable)
- View experiment logs via `kubectl logs -f <chaos-pod-name>`

