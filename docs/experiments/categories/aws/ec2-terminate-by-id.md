## EC2 Terminate By ID

It contains tunables to execute the `ec2-terminate-by-id` experiment. This experiment stops the given ec2 instance matched by `EC2_INSTANCE_ID` and `REGION`. It restarts the instance after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and AWS specific tunables

Refer the [common attributes](../common/common.md) and [AWS specific tunable](common.md) to tune the common tunables for all experiments and aws specific tunables.  

### Stop Instances By ID

It contains comma separated list of instances IDs subjected to ec2 stop chaos. It can be tuned via `EC2_INSTANCE_ID` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/aws/ec2-terminate-by-id/instance-id.yaml yaml)
```yaml
# contains the instance id, to be terminated/stopped
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: ec2-terminate-by-id-sa
  experiments:
  - name: ec2-terminate-by-id
    spec:
      components:
        env:
        # id of the ec2 instance
        - name: EC2_INSTANCE_ID
          value: 'instance-1'
        # region for the ec2 instance
        - name: REGION
          value: '<region for EC2_INSTANCE_ID>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
