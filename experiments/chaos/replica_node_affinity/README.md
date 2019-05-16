## Experiment Metadata

| Type  | Description                                           | Storage | K8s Platform |
| ----- | ----------------------------------------------------- | ------- | ------------ |
| Chaos | Ensuring if the jiva replica pod is sticked to a node | OpenEBS | Any          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Jiva replica pod should not be scheduled on any other node.
- It should schedule on the same node after recovery
- Storage target pods are healthy

## Notes

- This experiment cordons the node where one of the replica pods  is running and ensures if it is not scheduled on another available node.

## Associated Utils 

- `pod_node_affinity.yml`

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

