It contains tunables to execute the `node-io-stress` experiment. This experiment stresses the i/o of the given node for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and Node specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Node specific tunable](common-tunables-for-node-experiments.md) to tune the common tunables for all experiments and node specific tunables.  

### Filesystem Utilization Percentage

It stresses the `FILESYSTEM_UTILIZATION_PERCENTAGE` percentage of total free space available in the node. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-io-stress/filesystem-utilization-percentage.yaml yaml)
```yaml
# stress the i/o of the targeted node with FILESYSTEM_UTILIZATION_PERCENTAGE of total free space 
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_BYTES.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # percentage of total free space of file system
        - name: FILESYSTEM_UTILIZATION_PERCENTAGE
          value: '10' # in percentage
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Filesystem Utilization Bytes

It stresses the `FILESYSTEM_UTILIZATION_BYTES` GB of the i/o of the targeted node. 
It is mutually exclusive with the `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV. If `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `FILESYSTEM_UTILIZATION_BYTES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-io-stress/filesystem-utilization-bytes.yaml yaml)
```yaml
# stress the i/o of the targeted node with given FILESYSTEM_UTILIZATION_BYTES
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_PERCENTAGE.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # file system to be stress in GB
        - name: FILESYSTEM_UTILIZATION_BYTES
          value: '500' # in GB
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Limit CPU Utilization

The CPU usage can be limit to `CPU` cpu while performing io stress. It can be tuned via `CPU` ENV.

Use the following example to tune this:
 [embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-io-stress/cpu.yaml yaml)

### Workers For Stress

The i/o and VM workers count for the stress can be tuned with `NUMBER_OF_WORKERS` and `VM_WORKERS` ENV respectively. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-io-stress/workers.yaml yaml)
```yaml
# define the workers count for the i/o and vm
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # total number of io workers involved in stress
        - name: NUMBER_OF_WORKERS
          value: '4' 
          # total number of vm workers involved in stress
        - name: VM_WORKERS
          value: '1'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
