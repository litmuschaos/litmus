It contains tunables to execute the `node-memory-hog` experiment. This experiment stresses the memory of the given node for the specified `TOTAL_CHAOS_DURATION` duration.

### Common and Node specific tunables

Refer the [common attributes](../common/common.md) and [Node specific tunable](common.md) to tune the common tunables for all experiments and node specific tunables.  

### Memory Consumption Percentage

It stresses the `MEMORY_CONSUMPTION_PERCENTAGE` percentage of total node capacity of the targeted node. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-memory-hog/memory-consumption-percentage.yaml yaml)
```yaml
# stress the memory of the targeted node with MEMORY_CONSUMPTION_PERCENTAGE of node capacity
# it is mutually exclusive with the MEMORY_CONSUMPTION_MEBIBYTES.
# if both are provided then it will use MEMORY_CONSUMPTION_PERCENTAGE for stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-memory-hog-sa
  experiments:
  - name: node-memory-hog
    spec:
      components:
        env:
        # percentage of total node capacity to be stressed
        - name: MEMORY_CONSUMPTION_PERCENTAGE
          value: '10' # in percentage
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Memory Consumption Mebibytes

It stresses the `MEMORY_CONSUMPTION_MEBIBYTES` MiBi of the memory of the targeted node. 
It is mutually exclusive with the `MEMORY_CONSUMPTION_PERCENTAGE` ENV. If `MEMORY_CONSUMPTION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `MEMORY_CONSUMPTION_MEBIBYTES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-memory-hog/memory-consumption-mebibytes.yaml yaml)
```yaml
# stress the memory of the targeted node with given MEMORY_CONSUMPTION_MEBIBYTES
# it is mutually exclusive with the MEMORY_CONSUMPTION_PERCENTAGE.
# if both are provided then it will use MEMORY_CONSUMPTION_PERCENTAGE for stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-memory-hog-sa
  experiments:
  - name: node-memory-hog
    spec:
      components:
        env:
        # node memory to be stressed
        - name: MEMORY_CONSUMPTION_MEBIBYTES
          value: '500' # in MiBi
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Workers For Stress

The workers count for the stress can be tuned with `NUMBER_OF_WORKERS` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-memory-hog/workers.yaml yaml)
```yaml
# provide for the workers count for the stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-memory-hog-sa
  experiments:
  - name: node-memory-hog
    spec:
      components:
        env:
        # total number of workers involved in stress
        - name: NUMBER_OF_WORKERS
          value: '1' 
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
