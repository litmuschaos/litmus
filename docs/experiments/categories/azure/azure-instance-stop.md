It contains tunables to execute the `azure-instance-stop` experiment. This experiment stops the given azure instances matched by `AZURE_INSTANCE_NAME` and `RESOURCE_GROUP`. It restarts the instance after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common Experiment Tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) to tune the common tunables for all the experiments.

### Stop Instances By Name

It contains comma separated list of instance names subjected to instance stop chaos. It can be tuned via `AZURE_INSTANCE_NAME` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/azure/azure-instance-stop/azure-instance.yaml yaml)
```yaml
## contains the azure instance details
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: azure-instance-stop-sa
  experiments:
  - name: azure-instance-stop
    spec:
      components:
        env:
        # comma separated list of azore instance names
        - name: AZURE_INSTANCE_NAME
          value: 'instance-01,instance-02'
        # name of the resource group
        - name: RESOURCE_GROUP
          value: '<resource group of AZURE_INSTANCE_NAME>'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/azure/azure-instance-stop/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: azure-instance-stop-sa
  experiments:
  - name: azure-instance-stop
    spec:
      components:
        env:
        # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '10'
         # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
        - name: AZURE_INSTANCE_NAME
          value: 'instance-01,instance-02'
        - name: RESOURCE_GROUP
          value: '<resource group of AZURE_INSTANCE_NAME>'
```
