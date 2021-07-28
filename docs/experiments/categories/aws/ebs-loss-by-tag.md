# EBS Loss By Tag

It contains tunable to execute the `ebs-loss-by-tag` experiment. This experiment detach the given ebs volume and reattached after waiting for the specified `TOTAL_CHAOS_DURATION` duration.


### Target single volume

It will detach a random single ebs volume with given `EBS_VOLUME_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>

### Target Percent of volumes

It will detach the `VOLUME_AFFECTED_PERC` percentage of ebs volumes with given `EBS_VOLUME_TAG` tag and `REGION` region.

Use the following example to tune this:
<references to the sample manifest>