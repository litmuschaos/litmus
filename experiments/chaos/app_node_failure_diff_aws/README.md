## Experiment Metadata

| Type  | Description                                | Storage | Applications  | K8s Platform |
| ----- | ------------------------------------------ | ------- | ------------- | ------------ |
| Chaos | Fail the node where application is running | OpenEBS | Percona MySQL | AWS          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Database consistency is maintained as per db integrity check utils
- Storage target pods are healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage by failing the node where application was running.
- Tests Recovery workflows for the PV & data integrity post recovery 

## Associated Utils 

- `chaosutil_aws.yml`

## Litmusbook Environment Variables

### Application

| Parameter             | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| APP_NAMESPACE         | Namespace in which application pods are deployed             |
| APP_LABEL             | Unique Labels in `key=value` format of application deployment |
| APP_PVC               | Name of persistent volume claim used for app's volume mounts |
| AWS_ACCESS_KEY_ID     | Access key of AWS account.                                   |
| AWS_SECRET_ACCESS_KEY | AWS account secret access key                                |

### Chaos 

| Parameter | Description                                                  |
| --------- | ------------------------------------------------------------ |
| Action    | The chaos action to be performed ( stopped,running,present,absent,restarted) |

### Health Checks 

| Parameter              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| LIVENESS_APP_NAMESPACE | Namespace in which external liveness pods are deployed, if any |
| LIVENESS_APP_LABEL     | Unique Labels in `key=value` format for external liveness pod, if any |
| DATA_PERSISTENCY       | Data accessibility & integrity verification post recovery (enabled, disabled) |

