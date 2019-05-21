## Experiment Metadata

| Type       | Description                             | Storage | Applications | K8s Platform |
| ---------- | --------------------------------------- | ------- | ------------ | ------------ |
| Functional | Scaling statefulset application replica | OpenEBS | Cassandra    | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.

## Exit-Criteria

- Application should be scaled by increasing the number of replicas.
- The number of ready_replicas should match the desired count.
- The storage target should be created and be accessible.

## Notes

- This functional test checks if the statefulset application consuming openebs storage can be scaled.
- The litmusbook accepts parameters in the form of environmental variables.

## Associated Utils 

- `scale_replicas.yml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| APP_PVC       | Name of PVC which has to be deleted                          |
| REPLICA_COUNT | Desired number of replica pods                               |

