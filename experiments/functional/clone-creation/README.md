## Experiment Metadata

| Type       | Description                          | Storage | Applications | K8s Platform |
| ---------- | ------------------------------------ | ------- | ------------ | ------------ |
| Functional | Creating clone using volume snapshot | OpenEBS | Any          | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.
- Volume snapshot should be created.

## Exit-Criteria

- Cloned volume should be created successfully.
- The cloned volume should contain data available during snapshot creation.

## Notes

- This functional test checks if the Cloned volume can be created successfully using volume snapshot.
- This litmusbook can be used to validate both the types of application deployments such as K8s deployment and statefulsets.
- The litmus book expects the size of cloned volume should be equal to the parent volume. If not, the test should fail saying that the clone and parent volume should have same capacity.

## Associated Utils 

- `create_clone.yml`

## Litmusbook Environment Variables

### Application

| Parameter              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| APP_NAMESPACE          | Namespace in which application pods are deployed             |
| APP_LABEL              | Unique Labels in `key=value` format of application deployment |
| APP_PVC                | Name of PVC on which snapshot is created                     |
| PROVIDER_STORAGE_CLASS | The storage class used for promoting clone                   |
| CLONE_VOL_CLAIM        | The name for clone volume                                    |
| SNAPSHOT               | Snapshot name                                                |
| CAPACITY               | The capacity of volume which should be equal to the parent volume |

