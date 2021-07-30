## Pod CPU Hog

It contains tunables to execute the `pod-cpu-hog` experiment. This experiment stresses the cpu of the given pod for the specified `TOTAL_CHAOS_DURATION` duration. 

### CPU Cores

It stresses the `CPU_CORE` cpu cores of the targeted pod for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`). For other runtimes provide the appropriate path.

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.
Provide the stress image via `STRESS_IMAGE` ENV for the pumba library.

Use the following example to tune this:
<references to the sample manifest>