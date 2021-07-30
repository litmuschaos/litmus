## Azure Instance Stop

It contains tunables to execute the `azure-instance-stop` experiment. This experiment stops the given azure instances matched by `AZURE_INSTANCE_NAME` and `RESOURCE_GROUP`. It restarts the instance after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>
