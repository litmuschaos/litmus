## Experiment Metadata

| Type  | Description                                        | Storage | Applications  | K8s Platform |
| ----- | -------------------------------------------------- | ------- | ------------- | ------------ |
| Chaos | Drain the node where application pod is scheduled. | OpenEBS | Percona MySQL | Any          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application pod should be scheduled again.
- Data written prior to chaos is successfully retrieved/read
- Storage target pods are healthy

## Notes

- This experiment drains the node where application pod is running and ensures if it is scheduled on another available node.

## Associated Utils 

- `cordon_drain_node.yaml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| APP_PVC       | Name of persistent volume claim used for app's volume mounts |

### Health Checks 

| Parameter              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| LIVENESS_APP_NAMESPACE | Namespace in which external liveness pods are deployed, if any |
| LIVENESS_APP_LABEL     | Unique Labels in `key=value` format for external liveness pod, if any |
| DATA_PERSISTENCY       | Data accessibility & integrity verification post recovery (enabled, disabled) |

