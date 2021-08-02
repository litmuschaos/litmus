It contains tunables to execute the `node-cpu-hog` experiment. This experiment stress the cpu of the given node for the specified `TOTAL_CHAOS_DURATION` duration. 

### Common and Node specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Node specific tunable](common-tunables-for-node-experiments.md) to tune the common tunables for all experiments and node specific tunables.  

### Node CPU Cores

It contains number of cores of node CPU to be consumed. It can be tuned via `NODE_CPU_CORE` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/nodes/node-cpu-hog/node-cpu-core.yaml yaml)
```yaml
# stress the cpu of the targeted nodes
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-cpu-hog-sa
  experiments:
  - name: node-cpu-hog
    spec:
      components:
        env:
        # number of cpu cores to be stressed
        - name: NODE_CPU_CORE
          value: '2'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
