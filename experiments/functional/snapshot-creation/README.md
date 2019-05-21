## Experiment Metadata

| Type       | Description                          | Storage | Applications | K8s Platform |
| ---------- | ------------------------------------ | ------- | ------------ | ------------ |
| Functional | Creating clone using volume snapshot | OpenEBS | Any          | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.

## Exit-Criteria

- Volume snapshot should be created successfully.

## Notes

- This functional test checks if the volume snapshot can be created successfully for a given pvc.
- The litmus book receives the parameters in form of environmental variables.

## Associated Utils 

- `create_snapshot.yml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                      |
| ------------- | ------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed |
| APP_PVC       | Name of PVC on which snapshot is created         |
| SNAPSHOT      | Snapshot name                                    |