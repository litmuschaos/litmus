## EBS Loss By Tag

It contains tunables to execute the `ebs-loss-by-tag` experiment. This experiment detaches the given ebs volumes and reattached them after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and AWS specific tunables

Refer the [common attributes](../common/common.md) and [AWS specific tunable](common.md) to tune the common tunables for all experiments and aws specific tunables.  

### Target single volume

It will detach a random single ebs volume with the given `EBS_VOLUME_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws/ebs-loss-by-tag/ebs-volume-tag.yaml yaml)
```yaml
# contains the tags for the ebs volumes 
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: ebs-loss-by-tag-sa
  experiments:
  - name: ebs-loss-by-tag
    spec:
      components:
        env:
        # tag of the ebs volume
        - name: EBS_VOLUME_TAG
          value: 'key:value'
        # region for the ebs volume
        - name: REGION
          value: '<region for EBS_VOLUME_TAG>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Target Percent of volumes

It will detach the `VOLUME_AFFECTED_PERC` percentage of ebs volumes with the given `EBS_VOLUME_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws/ebs-loss-by-tag/volume-affected-percentage.yaml yaml)
```yaml
# target percentage of the ebs volumes with the provided tag
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: ebs-loss-by-tag-sa
  experiments:
  - name: ebs-loss-by-tag
    spec:
      components:
        env:
        # percentage of ebs volumes filter by tag
        - name: VOLUME_AFFECTED_PERC
          value: '100'
        # tag of the ebs volume
        - name: EBS_VOLUME_TAG
          value: 'key:value'
        # region for the ebs volume
        - name: REGION
          value: '<region for EBS_VOLUME_TAG>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
