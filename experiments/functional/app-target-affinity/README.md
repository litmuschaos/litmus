## Experiment Metadata

| Type       | Description                                                  | Storage | Applications | K8s Platform |
| ---------- | ------------------------------------------------------------ | ------- | ------------ | ------------ |
| Functional | Ensure application and storage target are scheduled on same node | OpenEBS | Any          | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.

## Exit-Criteria

- Application services are accessible & pods are healthy
- The application pod and its corresponding storage target pod should be scheduled on the same no

## Notes

- This functional test checks if the application pod instance and its corresponding storage target pod are present in same node.

- This litmusbook can be used to validate both the types of application deployments such as K8s deployment and statefulsets.

- If it is not scheduled on same node, the test is considered to be failed.

  

## Associated Utils 

- `target_affinity_check.yml`,`sts_target_affinity_check.yml`

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| APP_NAMESPACE | Namespace in which application pods are deployed             |
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |
| OPERATOR_NS   | Namespace where OpenEBS components are deployed              |
| DEPLOY_TYPE   | Mode of app deployment, either 'Deployment' or statefulset.  |