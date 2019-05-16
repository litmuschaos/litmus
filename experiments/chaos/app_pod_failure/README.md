## Experiment Metadata

| Type  | Description              | Storage | Applications  | K8s Platform |
| ----- | ------------------------ | ------- | ------------- | ------------ |
| Chaos | Fail the application pod | OpenEBS | Percona MySQL | Any          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Database consistency is maintained as per db integrity check utils
- Storage target pods are healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage by failing the application pod.
- Tests Recovery workflow of the application pod.

## Associated Utils 

- `pod_failure_by_sigkill.yaml`

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

