## AWS-SSM experiments tunable

It contains the aws-ssm specific experiment tunables.

### CPU Cores

It stressed the `CPU_CORE` cpu cores of the `EC2_INSTANCE_ID` ec2 instance and `REGION` region for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>

### Memory Percentage

It stressed the `MEMORY_PERCENTAGE` percentage of free space of the `EC2_INSTANCE_ID` ec2 instance and `REGION` region for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>

### SSM Docs

It contains the details of the SSM docs i.e, `name, type, the format of ssm-docs`.

Use the following example to tune this:
<references to the sample manifest>

### Workers Count

It contains the `NUMBER_OF_WORKERS` workers for the stress. 

Use the following example to tune this:
<references to the sample manifest>

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>