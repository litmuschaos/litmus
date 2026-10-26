It contains the AWS specific experiment tunables.

### Managed Nodegroup

It specifies whether aws instances are part of managed nodeGroups. If instances belong to the managed nodeGroups then provide `MANAGED_NODEGROUP` as `enable` else provide it as `disable`. The default value is `disabled`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws/common/managed-nodegroup.yaml yaml)
```yaml
# it provided as enable if instances are part of self managed groups
# it is applicable for [ec2-terminate-by-id, ec2-terminate-by-tag]
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
        # if instance is part of a managed node-group
        # supports enable and disable values, default value: disable
        - name: MANAGED_NODEGROUP
          value: 'enable'
        # region for the ec2 instance
        - name: REGION
          value: '<region for instances>'
        # tag of the ec2 instance
        - name: EC2_INSTANCE_TAG
          value: 'key:value'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws/common/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
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
         # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          value: '60'
        - name: REGION
          value: '<region for instances>'
        - name: EC2_INSTANCE_TAG
          value: 'key:value'
        
```
