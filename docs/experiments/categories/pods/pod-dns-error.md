## Pod DNS Error

It contains tunables to execute the `pod-dns-error` experiment. This experiment disrupts DNS resolution of the targeted pods for the specified `TOTAL_CHAOS_DURATION` duration. 

### Target Host Names

It defines the comma-separated name of the target hosts subjected to chaos. It can be tuned with the `TARGET_HOSTNAMES` ENV.
If `TARGET_HOSTNAMES`not provided then all hostnames/domains will be targeted.

Use the following example to tune this:
<references to the sample manifest>

### Match Scheme

It determines whether the DNS query has to match exactly with one of the targets or can have any of the targets as a substring. It can be tuned with `MATCH_SCHEME` ENV. It supports `exact` or `substring` values.

Use the following example to tune this:
<references to the sample manifest>

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker` runtime only.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`).
