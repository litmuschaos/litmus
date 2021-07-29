## AWS-SSM Chaos By Tag

It contains tunables to execute the `aws-ssm-chaos-by-tag` experiment. This experiment stresses the given ec2 instance for the `TOTAL_CHAOS_DURATION` duration.


### Target single instance

It will stress a random single ec2 instance with the given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>

### Target Percent of instances

It will stress the `INSTANCE_AFFECTED_PERC` percentage of ec2 instances with the given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>