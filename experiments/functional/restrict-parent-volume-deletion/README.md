## Experiment Metadata

| Type       | Description                                              | Storage | Applications | K8s Platform |
| ---------- | -------------------------------------------------------- | ------- | ------------ | ------------ |
| Functional | Attempting to delete parent volume in presence of clones | OpenEBS | Any          | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.
- Volume snapshot  and clone should be created.

## Exit-Criteria

- Parent volume should not be allowed to delete in presence of clones.

## Notes

- This functional test checks if the parent volume can be deleted when there is clone.
- The litmusbook accepts parameters in the form of environmental variables.

## Associated Utils 

- `create_clone.yml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| APP_PVC       | Name of PVC which has to be deleted                          |
| SNAPSHOT      | Snapshot used for clone creation                             |

