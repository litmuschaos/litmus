# EBS Loss By ID

It contains tunable to execute the `ebs-loss-by-id` experiment. This experiment detach the given ebs volume matched by `EBS_VOLUME_ID` and `REGION`. It reattached the volume after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>