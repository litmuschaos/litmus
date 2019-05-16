## Experiment Metadata

| Type  | Description                                                  | Storage | Applications  | K8s Platform |
| ----- | ------------------------------------------------------------ | ------- | ------------- | ------------ |
| Chaos | Detach disk from node and verify the recovery after attaching it back | OpenEBS | Percona MySQL | AWS          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Storage target pods are healthy
- Pool and app pod should be running and healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage by failing the disk used by pool.
- Attaching the disk again and check if the components are healthy

## Associated Utils 

- `aws_chaos/disk_failure.yml`

## Litmusbook Environment Variables

### Application

| Parameter             | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| APP_NAMESPACE         | Namespace in which application pods are deployed             |
| APP_LABEL             | Unique Labels in `key=value` format of application deployment |
| APP_PVC               | Name of persistent volume claim used for app's volume mounts |
| AWS_ACCESS_KEY_ID     | Access key of AWS account.                                   |
| AWS_SECRET_ACCESS_KEY | AWS account secret access key                                |
| VOLUME_ID             | EBS VOLUME_ID to perform disk operations                     |
| INSTANCE_NAME         | Name of AWS instance                                         |

### Health Checks 

| Parameter              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| LIVENESS_APP_NAMESPACE | Namespace in which external liveness pods are deployed, if any |
| LIVENESS_APP_LABEL     | Unique Labels in `key=value` format for external liveness pod, if any |
| DATA_PERSISTENCY       | Data accessibility & integrity verification post recovery (enabled, disabled) |

