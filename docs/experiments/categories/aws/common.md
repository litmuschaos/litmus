## AWS experiments tunable

It contains the AWS specific experiment tunables.

### Managed Nodegroup

It specifies whether aws instances are part of managed nodeGroups. If instances belong to the managed nodeGroups then provide `MANAGED_NODEGROUP` as `enable` else provide it as `disable`. The default value is `disabled`.

Use the following example to tune this:
<references to the sample manifest>

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>
