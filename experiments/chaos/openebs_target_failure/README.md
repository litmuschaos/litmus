## Experiment Metadata

| Type  | Description                                                  | Storage | K8s Platform |
| ----- | ------------------------------------------------------------ | ------- | ------------ |
| Chaos | Kill the cstor target/Jiva controller container and check if gets created again | OpenEBS | Any          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Database consistency is maintained as per db integrity check utils
- Storage target pods are healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage target by killing the containers.
- The container should be created again and it should be healthy.

## Associated Utils 

- `cstor_target_container_kill.yml`,`cstor_target_failure.yaml`,`jiva_controller_pod_failure.yaml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| APP_PVC       | Name of persistent volume claim used for app's volume mounts |

### Chaos 

| Parameter        | Description                                  |
| ---------------- | -------------------------------------------- |
| CHAOS_TYPE       | The type of chaos to be induced.             |
| TARGET_CONTAINER | The container where the chaos to be induced. |

### 