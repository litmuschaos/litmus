It contains tunables to execute the `ec2-terminate-by-tag` experiment. This experiment stops the given ec2 instance and restarts them after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and AWS specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [AWS specific tunable](AWS-experiments-tunables.md) to tune the common tunables for all experiments and aws specific tunables.  

### Target single instance

It will stop a random single ec2 instance with the given `INSTANCE_TAG` tag and the `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws/ec2-terminate-by-tag/instance-tag.yaml yaml)
```yaml
# target the ec2 instances with matching tag
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: ec2-terminate-by-tag-sa
  experiments:
  - name: ec2-terminate-by-tag
    spec:
      components:
        env:
        # tag of the ec2 instance
        - name: INSTANCE_TAG
          value: 'key:value'
        # region for the ec2 instance
        - name: REGION
          value: '<region for instance>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Target Percent of instances

It will stop the `INSTANCE_AFFECTED_PERC` percentage of ec2 instances with the given `INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws/ec2-terminate-by-tag/instance-affected-percentage.yaml yaml)
```yaml
# percentage of ec2 instances, needs to terminate with provided tags
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: ec2-terminate-by-tag-sa
  experiments:
  - name: ec2-terminate-by-tag
    spec:
      components:
        env:
        # percentage of ec2 instance filterd by tags 
        - name: INSTANCE_AFFECTED_PERC
          value: '100'
        # tag of the ec2 instance
        - name: INSTANCE_TAG
          value: 'key:value'
        # region for the ec2 instance
        - name: REGION
          value: '<region for instance>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
