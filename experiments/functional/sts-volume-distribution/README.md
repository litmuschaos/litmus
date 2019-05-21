## Experiment Metadata

| Type       | Description                                                  | Storage | Applications | K8s Platform |
| ---------- | ------------------------------------------------------------ | ------- | ------------ | ------------ |
| Functional | Ensure that the replicas are evenly distributed across pools | OpenEBS | Any          | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Statefulset application should be deployed successfully consuming OpenEBS storage.

## Exit-Criteria

- The volume replicas should be distributed across the storage pools.

## Notes

- This functional test checks if the volume replicas are scheduled in different storage pools available.
- The litmus book receives the parameters in form of environmental variables.
- Scaleup the application replica and check if the new replicas are scheduled into different pools.

## Litmusbook Environment Variables

### Application

| Parameter           | Description                                      |
| ------------------- | ------------------------------------------------ |
| APP_NAMESPACE       | Namespace in which application pods are deployed |
| APP_PVC             | Name of PVC on which snapshot is created         |
| APP_REPLICA         | The number of application replicas               |
| SCALE_REPLICA_COUNT | Desired number of replicas                       |