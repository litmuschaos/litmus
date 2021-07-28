# EC2 Terminate By ID

It contains tunable to execute the `ec2-terminate-by-id` experiment. This experiment stop the given ec2 instance matched by `EC2_INSTANCE_ID` and `REGION`. It restart the instance after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>