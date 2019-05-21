## Experiment Metadata

| Type       | Description                                                 | Storage | Applications | K8s Platform |
| ---------- | ----------------------------------------------------------- | ------- | ------------ | ------------ |
| Functional | Attempting  clone creation under snapshot rebuild scenarios | OpenEBS | Busybox      | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.

## Exit-Criteria

- Cloned volume should be created successfully post snapshot rebuild process.
- The cloned volume should contain data available during snapshot creation.

## Notes

- This functional test checks if the Cloned volume can be created successfully using volume snapshot post rebuild.
- The litmusbook receives necessary parameters inf the form of environmental variables.

## Associated Utils 

- `clone_during_rebuild.yml`,`clone_pre_rebuild.yml`,`clone_post_rebuild.yml`,`snap_rebuild_prerequisites.yml`

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
| CLONE_APP_NAME         | The application to consume cloned volume                     |
|                        |                                                              |