## GCP VM Instance Stop

It contains tunables to execute the `gcp-vm-instance-stop` experiment. This experiment stops the given gcp instances and restarts them after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Target GCP Instances

It will stop all the instances with the given `VM_INSTANCE_NAMES` instance names and corresponding `INSTANCE_ZONES` zone names in `GCP_PROJECT_ID` project. 

`NOTE:` The `VM_INSTANCE_NAMES` contains multiple comma-separated vm instances. The comma-separated zone names should be provided in the same order as instance names.

Use the following example to tune this:
<references to the sample manifest>

### Autoscaling NodeGroup

If vm instances belong to the autoscaling group then provide the `AUTO_SCALING_GROUP` as `enable` else provided it as `disable`. The default value of `AUTO_SCALING_GROUP` is `disable`.

Use the following example to tune this:
<references to the sample manifest>

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>
