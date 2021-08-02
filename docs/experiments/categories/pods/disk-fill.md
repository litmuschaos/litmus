It contains tunables to execute the `disk-fill` experiment. This experiment fills the ephemeral storage of the targeted pod for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and Pod specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Pod specific tunable](common-tunables-for-pod-experiments.md) to tune the common tunables for all experiments and pod specific tunables. 

### Disk Fill Percentage

It fills the `FILL_PERCENTAGE` percentage of the ephemeral-storage limit specified at `resource.limits.ephemeral-storage` inside the target application. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/disk-fill/fill-percentage.yaml yaml)
```yaml
## percentage of ephemeral storage limit specified at `resource.limits.ephemeral-storage` inside target application 
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
  chaosServiceAccount: disk-fill-sa
  experiments:
  - name: disk-fill
    spec:
      components:
        env:
        ## percentage of ephemeral storage limit, which needs to be filled
        - name: FILL_PERCENTAGE
          value: '80' # in percentage
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Disk Fill Mebibytes

It fills the `EPHEMERAL_STORAGE_MEBIBYTES` MiBi of ephemeral storage of the targeted pod. 
It is mutually exclusive with the `FILL_PERCENTAGE` ENV. If `FILL_PERCENTAGE` ENV is set then it will use the percentage for the fill otherwise, it will fill the ephemeral storage based on `EPHEMERAL_STORAGE_MEBIBYTES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/disk-fill/ephemeral-storage-mebibytes.yaml yaml)
```yaml
# ephemeral storage which needs to fill in will application
# if ephemeral-storage limits is not specified inside target application
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
  chaosServiceAccount: disk-fill-sa
  experiments:
  - name: disk-fill
    spec:
      components:
        env:
        ## ephemeral storage size, which needs to be filled
        - name: EPHEMERAL_STORAGE_MEBIBYTES
          value: '256' #in MiBi
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Data Block Size

It defines the size of the data block used to fill the ephemeral storage of the targeted pod. It can be tuned via `DATA_BLOCK_SIZE` ENV. Its unit is `KB`.
The default value of `DATA_BLOCK_SIZE` is `256`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/disk-fill/data-block-size.yaml yaml)
```yaml
# size of the data block used to fill the disk
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
  chaosServiceAccount: disk-fill-sa
  experiments:
  - name: disk-fill
    spec:
      components:
        env:
        ## size of data block used to fill the disk
        - name: DATA_BLOCK_SIZE
          value: '256' #in KB
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Container Path

It defines the storage location of the containers inside the host(node/VM). It can be tuned via `CONTAINER_PATH` ENV. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/disk-fill/container-path.yaml yaml)
```yaml
# path inside node/vm where containers are present 
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
  chaosServiceAccount: disk-fill-sa
  experiments:
  - name: disk-fill
    spec:
      components:
        env:
        # storage location of the containers
        - name: CONTAINER_PATH
          value: '/var/lib/docker/containers'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
