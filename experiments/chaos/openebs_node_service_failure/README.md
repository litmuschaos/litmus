## Experiment Metadata

| Type  | Description                                                  | Storage | K8s Platform |
| ----- | ------------------------------------------------------------ | ------- | ------------ |
| Chaos | Restart node services such as kubelet/docker and observe the behavior | OpenEBS | AWS,GKE      |

## Entry-Criteria

- Application services are accessible & pods are healthy
- Application writes are successful 

## Exit-Criteria

- Application services are accessible & pods are healthy
- Data written prior to chaos is successfully retrieved/read
- Database consistency is maintained as per db integrity check utils
- Storage target pods are healthy

## Notes

- Typically used as a disruptive test, to cause loss of access to storage by injecting prolonged network delay
- Tests Recovery workflows for the PV & data integrity post recovery 

## Associated Utils 

- `svc_chaos.yml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| APP_PVC       | Name of persistent volume claim used for app's volume mounts |

### Chaos 

| Parameter      | Description                                               |
| -------------- | --------------------------------------------------------- |
| SVC_CHAOS      | The component where chaos to be injected(kubelet, docker) |
| CHAOS_DURATION | Period (in sec)for which induced delay is maintained      |

### Health Checks 

| Parameter              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| LIVENESS_APP_NAMESPACE | Namespace in which external liveness pods are deployed, if any |
| LIVENESS_APP_LABEL     | Unique Labels in `key=value` format for external liveness pod, if any |
| DATA_PERSISTENCY       | Data accessibility & integrity verification post recovery (enabled, disabled) |

