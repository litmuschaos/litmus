It contains the aws-ssm specific experiment tunables.

### CPU Cores

It stressed the `CPU_CORE` cpu cores of the `EC2_INSTANCE_ID` ec2 instance and `REGION` region for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/common/cpu-cores.yaml yaml)
```yaml
# provide the cpu cores to stress the ec2 instance
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
        # cpu cores for the stress
        - name: CPU_CORE
          value: '1'
        # id of the ec2 instance
        - name: EC2_INSTANCE_ID
          value: 'instance-01'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the EC2_INSTANCE_ID>'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Memory Percentage

It stressed the `MEMORY_PERCENTAGE` percentage of free space of the `EC2_INSTANCE_ID` ec2 instance and `REGION` region for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/common/memory-percentage.yaml yaml)
```yaml
# provide the memory pecentage to stress the instance memory
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
    specEC2_INSTANCE_ID:
      components:
        env:
        # memory percentage for the stress
        - name: MEMORY_PERCENTAGE
          value: '80'
        # id of the ec2 instance
        - name: EC2_INSTANCE_ID
          value: 'instance-01'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the EC2_INSTANCE_ID>'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### SSM Docs

It contains the details of the SSM docs i.e, `name, type, the format of ssm-docs`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/common/ssm-document-details.yaml yaml)
```yaml
## provide the details of the ssm document details
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
        # name of the ssm docs
        - name: DOCUMENT_NAME
          value: 'AWS-SSM-Doc'
        # format of the ssm docs
        - name: DOCUMENT_FORMAT
          value: 'YAML'
        # type of the ssm docs
        - name: DOCUMENT_TYPE
          value: 'command'
        # path of the ssm docs
        - name: DOCUMENT_PATH
          value: ''
        # id of the ec2 instance
        - name: EC2_INSTANCE_ID
          value: 'instance-01'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the EC2_INSTANCE_ID>'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Workers Count

It contains the `NUMBER_OF_WORKERS` workers for the stress. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/common/workers.yaml yaml)
```yaml
# workers details used to stress the instance
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
    specEC2_INSTANCE_ID:
      components:
        env:
        # number of workers used for stress
        - name: NUMBER_OF_WORKERS
          value: '1'
        # id of the ec2 instance
        - name: EC2_INSTANCE_ID
          value: 'instance-01'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the EC2_INSTANCE_ID>'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/common/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
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
    specEC2_INSTANCE_ID:
      components:
        env:
        # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          value: '60'
        - name: CPU_CORE
          value: '1'
        - name: EC2_INSTANCE_ID
          value: 'instance-01'
        - name: REGION
          value: '<region of the EC2_INSTANCE_ID>'
```
