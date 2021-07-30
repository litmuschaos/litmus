## Container Kill

It contains tunables to execute the `container-kill` experiment. This experiment kills the target container of the targeted pods for the specified `TOTAL_CHAOS_DURATION` duration.

### Kill Specific Container

It defines the name of the targeted container subjected to chaos. It can be tuned via `TARGET_CONTAINER` ENV. If `TARGET_CONTAINER` is provided as empty then it will use the first container of the targeted pod.

Use the following example to tune this:
<references to the sample manifest>

### Multiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`). For other runtimes provide the appropriate path.

### Signal For Kill

It defines the Linux signal passed while killing the container. It can be tuned via `SIGNAL` ENV. It defaults to the `SIGTERM`.

Use the following example to tune this:
<references to the sample manifest>

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.

Use the following example to tune this:
<references to the sample manifest>