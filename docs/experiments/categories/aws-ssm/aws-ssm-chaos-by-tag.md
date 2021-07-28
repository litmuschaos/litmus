# AWS-SSM Chaos By Tag

It contains tunable to execute the `aws-ssm-chaos-by-tag` experiment. This experiment stress the given ec2 instance for the `TOTAL_CHAOS_DURATION` duration.


### Target single instance

It will stress a random single ec2 instance with given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>

### Target Percent of instances

It will stress the `INSTANCE_AFFECTED_PERC` percentage of ec2 instances with given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>