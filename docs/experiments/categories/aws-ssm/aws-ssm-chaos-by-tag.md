It contains tunables to execute the `aws-ssm-chaos-by-tag` experiment. This experiment stresses the given ec2 instance for the `TOTAL_CHAOS_DURATION` duration.

### Common and AWS-SSM specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [AWS-SSM specific tunable](AWS-SSM-experiments-tunables.md) to tune the common tunables for all experiments and aws-ssm specific tunables.  

### Target single instance

It will stress a random single ec2 instance with the given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws-ssm/aws-ssm-chaos-by-tag/instance-tag.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: aws-ssm-chaos-by-tag-sa
  experiments:
  - name: aws-ssm-chaos-by-tag
    spec:
      components:
        env:
        # tag of the ec2 instances
        - name: EC2_INSTANCE_TAG
          value: 'key:value'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the ec2 instances>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Target Percent of instances

It will stress the `INSTANCE_AFFECTED_PERC` percentage of ec2 instances with the given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws-ssm/aws-ssm-chaos-by-tag/instance-affected-percentage.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: aws-ssm-chaos-by-tag-sa
  experiments:
  - name: aws-ssm-chaos-by-tag
    spec:
      components:
        env:
        # percentage of the ec2 instances filtered by tags
        - name: INSTANCE_AFFECTED_PERC
          value: '100'
        # tag of the ec2 instances
        - name: EC2_INSTANCE_TAG
          value: 'key:value'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the ec2 instances>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
