## Container Kill

It contains tunables to execute the `container-kill` experiment. This experiment kills the target container of the targeted pods for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and Pod specific tunables

Refer the [common attributes](../common/common.md) and [Pod specific tunable](common.md) to tune the common tunables for all experiments and pod specific tunables.  

### Kill Specific Container

It defines the name of the targeted container subjected to chaos. It can be tuned via `TARGET_CONTAINER` ENV. If `TARGET_CONTAINER` is provided as empty then it will use the first container of the targeted pod.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/container-kill/kill-specific-container.yaml yaml)
```yaml
# kill the specific target container
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
  chaosServiceAccount: container-kill-sa
  experiments:
  - name: container-kill
    spec:
      components:
        env:
        # name of the target container
        - name: TARGET_CONTAINER
          value: 'nginx'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Multiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/container-kill/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
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
  chaosServiceAccount: container-kill-sa
  experiments:
  - name: container-kill
    spec:
      components:
        env:
        # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`). For other runtimes provide the appropriate path.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/container-kill/container-runtime-and-socket-path.yaml yaml)
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
  chaosServiceAccount: container-kill-sa
  experiments:
  - name: container-kill
    spec:
      components:
        env:
        # runtime for the container
        # supports docker, containerd, crio
        - name: CONTAINER_RUNTIME
          value: 'docker'
        # path of the socket file
        - name: SOCKET_PATH
          value: '/var/run/docker.sock'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Signal For Kill

It defines the Linux signal passed while killing the container. It can be tuned via `SIGNAL` ENV. It defaults to the `SIGTERM`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/container-kill/signal.yaml yaml)
```yaml
# specific linux signal passed while kiiling container
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
  chaosServiceAccount: container-kill-sa
  experiments:
  - name: container-kill
    spec:
      components:
        env:
        # signal passed while killing container
        # defaults to SIGTERM
        - name: SIGNAL
          value: 'SIGKILL'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/container-kill/pumba.yaml yaml)
```yaml
# pumba chaoslib used to kill the container
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
  chaosServiceAccount: container-kill-sa
  experiments:
  - name: container-kill
    spec:
      components:
        env:
        # name of the lib
        # supoorts pumba and litmus
        - name: LIB
          value: 'pumba'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
