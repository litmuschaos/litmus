## EBS Loss By ID

It contains tunables to execute the `ebs-loss-by-id` experiment. This experiment detaches the given ebs volume matched by `EBS_VOLUME_ID` and `REGION`. It reattached the volume after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and AWS specific tunables

Refer the [common attributes](../common/common.md) and [AWS specific tunable](common.md) to tune the common tunables for all experiments and aws specific tunables.  

### Detach Volumes By ID

It contains comma separated list of volume IDs subjected to ebs detach chaos. It can be tuned via `EBS_VOLUME_ID` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws/ebs-loss-by-id/ebs-volume-id.yaml yaml)
```yaml
# contains ebs volume id 
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: ebs-loss-by-id-sa
  experiments:
  - name: ebs-loss-by-id
    spec:
      components:
        env:
        # id of the ebs volume
        - name: EBS_VOLUME_ID
          value: 'ebs-vol-1'
        # region for the ebs volume
        - name: REGION
          value: '<region for EBS_VOLUME_ID>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
