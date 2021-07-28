# EC2 Terminate By Tag

It contains tunable to execute the `ec2-terminate-by-tag` experiment. This experiment stop the given ec2 instance and restart after waiting for the specified `TOTAL_CHAOS_DURATION` duration.


### Target single instance

It will stop a random single ec2 instance with given `INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>

### Target Percent of instances

It will stop the `INSTANCE_AFFECTED_PERC` percentage of ec2 instances with given `INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>