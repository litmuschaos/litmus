## Experiment Metadata

| Type  | Description                                                  | Storage | K8s Platform |
| ----- | ------------------------------------------------------------ | ------- | ------------ |
| Chaos | Delete the Jiva replica pod and ensure that it gets scheduled again | OpenEBS | Any          |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Database consistency is maintained as per db integrity check utils
- Storage target pods are healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage replica by deleting it.
- The replica pod should be rescheduled again successfully.

## Associated Utils 

- `jiva_replica_pod_failure.yaml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |

