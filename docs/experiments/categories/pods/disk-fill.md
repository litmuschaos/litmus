## Disk Fill

It contains tunables to execute the `disk-fill` experiment. This experiment fills the ephemeral storage of the targeted pod for the specified `TOTAL_CHAOS_DURATION` duration.

### Disk Fill Percentage

It fills the `FILL_PERCENTAGE` percentage of the ephemeral-storage limit specified at `resource.limits.ephemeral-storage` inside the target application. 

Use the following example to tune this:
<references to the sample manifest>

### Disk Fill Mebibytes

It fills the `EPHEMERAL_STORAGE_MEBIBYTES` MiBi of ephemeral storage of the targeted pod. 
It is mutually exclusive with the `FILL_PERCENTAGE` ENV. If `FILL_PERCENTAGE` ENV is set then it will use the percentage for the fill otherwise, it will fill the ephemeral storage based on `EPHEMERAL_STORAGE_MEBIBYTES` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Data Block Size

It defines the size of the data block used to fill the ephemeral storage of the targeted pod. It can be tuned via `DATA_BLOCK_SIZE` ENV. Its unit is `KB`.
The default value of `DATA_BLOCK_SIZE` is `256`.

Use the following example to tune this:
<references to the sample manifest>

### Container Path

It defines the storage location of the containers inside the host(node/VM). It can be tuned via `CONTAINER_PATH` ENV. 

Use the following example to tune this:
<references to the sample manifest>
