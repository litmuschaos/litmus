## Pod IO Stress

It contains tunables to execute the `pod-io-stress` experiment. This experiment stresses the i/o of the given pod for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and Pod specific tunables

Refer the [common attributes](../common/common.md) and [Pod specific tunable](common.md) to tune the common tunables for all experiments and pod specific tunables. 

### Filesystem Utilization Percentage

It stresses the `FILESYSTEM_UTILIZATION_PERCENTAGE` percentage of total free space available in the pod. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-io-stress/filesystem-utilization-percentage.yaml yaml)
```yaml
# stress the i/o of the targeted pod with FILESYSTEM_UTILIZATION_PERCENTAGE of total free space 
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_BYTES.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # percentage of free space of file system, need to be stressed
        - name: FILESYSTEM_UTILIZATION_PERCENTAGE
          value: '10' #in GB
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Filesystem Utilization Bytes

It stresses the `FILESYSTEM_UTILIZATION_BYTES` GB of the i/o of the targeted pod. 
It is mutually exclusive with the `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV. If `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `FILESYSTEM_UTILIZATION_BYTES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-io-stress/filesystem-utilization-bytes.yaml yaml)
```yaml
# stress the i/o of the targeted pod with given FILESYSTEM_UTILIZATION_BYTES
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_PERCENTAGE.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # size of io to be stressed
        - name: FILESYSTEM_UTILIZATION_BYTES
          value: '1' #in GB
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`). For other runtimes provide the appropriate path.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-io-stress/container-runtime-and-socket-path.yaml yaml)
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
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

### Mount Path

The volume mount path, which needs to be filled. It can be tuned with `VOLUME_MOUNT_PATH` ENV. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-io-stress/mount-path.yaml yaml)
```yaml
# provide the volume mount path, which needs to be filled
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # path need to be stressed/filled
        - name: VOLUME_MOUNT_PATH
          value: '10'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Workers For Stress

The worker's count for the stress can be tuned with `NUMBER_OF_WORKERS` ENV. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-io-stress/workers.yaml yaml)
```yaml
# number of workers for the stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # number of io workers 
        - name: NUMBER_OF_WORKERS
          value: '4'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-io-stress/pumba.yaml yaml)
```yaml
# use the pumba lib for io stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # name of lib
        # it supports litmus and pumba lib
        - name: LIB
          value: 'pumba'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
