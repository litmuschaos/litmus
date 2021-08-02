It contains tunables to execute the `aws-ssm-chaos-by-id` experiment. This experiment stresses the ec2 instance matched by `EC2_INSTANCE_ID` and `REGION` for the `TOTAL_CHAOS_DURATION` duration.

### Common and AWS-SSM specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [AWS-SSM specific tunable](AWS-SSM-experiments-tunables.md) to tune the common tunables for all experiments and aws-ssm specific tunables.  

### Stress Instances By ID

It contains comma separated list of instances IDs subjected to ec2 stop chaos. It can be tuned via `EC2_INSTANCE_ID` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws-ssm/aws-ssm-chaos-by-id/instance-id.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: aws-ssm-chaos-by-id-sa
  experiments:
  - name: aws-ssm-chaos-by-id
    spec:
      components:
        env:
        # comma separated list of ec2 instance id(s)
        # all instances should belongs to the same region(REGION)
        - name: EC2_INSTANCE_ID
          value: 'instance-01,instance-02'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the EC2_INSTANCE_ID>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
