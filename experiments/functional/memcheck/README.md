## Experiment Metadata

| Type       | Description                                   | Storage | Applications | K8s Platform |
| ---------- | --------------------------------------------- | ------- | ------------ | ------------ |
| Functional | Check memory consumption for certain workload | OpenEBS | Any          | Any          |

## Entry-Criteria

- K8s nodes should be ready.
- Application should be deployed successfully consuming OpenEBS storage.

## Exit-Criteria

- Application services are accessible & pods are healthy
- Memory consumption should not exceed the threshold value set.

## Notes

- This functional test checks if the memory consumption of storage target pod doesn't exceed the given threshold value.
- If it exceeds, the test is considered to be failed.

## Associated Utils 

- `test_mem.py`

## Litmusbook Environment Variables

### Application

| Parameter        | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| APP_NAMESPACE    | Namespace in which application pods are deployed             |
| APP_LABEL        | Unique Labels in `key=value` format of application deployment |
| TARGET_NAMESPACE | Namespace where OpenEBS components are deployed              |
| APP_PVC          | The PVC name where the test has to be performed              |