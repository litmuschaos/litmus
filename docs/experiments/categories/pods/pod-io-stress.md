## Pod IO Stress

It contains tunables to execute the `pod-io-stress` experiment. This experiment stresses the i/o of the given pod for the specified `TOTAL_CHAOS_DURATION` duration.

### Filesystem Utilization Percentage

It stresses the `FILESYSTEM_UTILIZATION_PERCENTAGE` percentage of total free space available in the pod. 

Use the following example to tune this:
<references to the sample manifest>

### Filesystem Utilization Bytes

It stresses the `FILESYSTEM_UTILIZATION_BYTES` GB of the i/o of the targeted pod. 
It is mutually exclusive with the `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV. If `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `FILESYSTEM_UTILIZATION_BYTES` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`). For other runtimes provide the appropriate path.

### Mount Path

The volume mount path, which needs to be filled. It can be tuned with `VOLUME_MOUNT_PATH` ENV. 

Use the following example to tune this:
<references to the sample manifest>

### Workers For Stress

The worker's count for the stress can be tuned with `NUMBER_OF_WORKERS` ENV. 

Use the following example to tune this:
<references to the sample manifest>

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.

Use the following example to tune this:
<references to the sample manifest>