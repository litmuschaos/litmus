## Pod DNS Spoof

It contains tunables to execute the `pod-dns-spoof` experiment. This experiment spoof the DNS resolution of the targeted pods for the specified `TOTAL_CHAOS_DURATION` duration. 

### Spoof Map

It defines the map of the target hostnames eg. '{"abc.com":"spoofabc.com"}' where the key is the hostname that needs to be spoofed and value is the hostname where it will be spoofed/redirected to. It can be tuned via `SPOOF_MAP` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker` runtime only.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`).
