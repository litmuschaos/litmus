## Experiment Metadata

| Type  | Description                                         | Storage | K8s Platform |
| ----- | --------------------------------------------------- | ------- | ------------ |
| Chaos | Kill the pool pod and check if gets scheduled again | OpenEBS | Any          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Database consistency is maintained as per db integrity check utils
- Storage target pods are healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage pool by killing it.
- The pool pod should start again and it should be healthy.

## Associated Utils 

- `cstor_pool_kill.yml`,`pod_failure_by_sigkill.yaml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| APP_PVC       | Name of persistent volume claim used for app's volume mounts |

### Chaos 

| Parameter        | Description                      |
| ---------------- | -------------------------------- |
| CHAOS_TYPE       | The type of chaos to be induced. |
| CHAOS_ITERATIONS | The number of chaos iterations   |

### Health Checks 

| Parameter              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| LIVENESS_APP_NAMESPACE | Namespace in which external liveness pods are deployed, if any |
| LIVENESS_APP_LABEL     | Unique Labels in `key=value` format for external liveness pod, if any |
| DATA_PERSISTENCY       | Data accessibility & integrity verification post recovery (enabled, disabled) |

