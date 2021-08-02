It contains tunables to execute the `pod-dns-spoof` experiment. This experiment spoof the DNS resolution of the targeted pods for the specified `TOTAL_CHAOS_DURATION` duration. 

### Common and Pod specific tunables

Refer the [common attributes](../common/common.md) and [Pod specific tunable](common.md) to tune the common tunables for all experiments and pod specific tunables. 

### Spoof Map

It defines the map of the target hostnames eg. '{"abc.com":"spoofabc.com"}' where the key is the hostname that needs to be spoofed and value is the hostname where it will be spoofed/redirected to. It can be tuned via `SPOOF_MAP` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-dns-spoof/spoof-map.yaml yaml)
```yaml
# contains the spoof map for the dns spoofing
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-dns-spoof-sa
  experiments:
  - name: pod-dns-spoof
    spec:
      components:
        env:
        # map of host names
        - name: SPOOF_MAP
          value: '{"abc.com":"spoofabc.com"}'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker` runtime only.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`).

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-dns-spoof/container-runtime-and-socket-path.yaml yaml)
```yaml
## provide the container runtime and socket file path
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-dns-spoof-sa
  experiments:
  - name: pod-dns-spoof
    spec:
      components:
        env:
        # runtime for the container
        # supports docker
        - name: CONTAINER_RUNTIME
          value: 'docker'
        # path of the socket file
        - name: SOCKET_PATH
          value: '/var/run/docker.sock'
        # map of host names
        - name: SPOOF_MAP
          value: '{"abc.com":"spoofabc.com"}'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
