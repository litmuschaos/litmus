It contains tunables to execute the `pod-memory-hog-exec` experiment. This experiment stresses the memory of the given pod for the specified `TOTAL_CHAOS_DURATION` duration. 

### Common and Pod specific tunables

Refer the [common attributes](../common/common.md) and [Pod specific tunable](common.md) to tune the common tunables for all experiments and pod specific tunables. 

### Memory Consumption

It stresses the `MEMORY_CONSUMPTION` MB memory of the targeted pod for the `TOTAL_CHAOS_DURATION` duration.
The memory consumption limit is 2000MB

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-memory-hog-exec/memory-consumption.yaml yaml)
```yaml
# memory to be stressed in MB
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
  chaosServiceAccount: pod-memory-hog-sa
  experiments:
  - name: pod-memory-hog
    spec:
      components:
        env:
        # memory consuption value in MB
        # it is limited to 2000MB
        - name: MEMORY_CONSUMPTION
          value: '500' #in MB
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Chaos Kill Commands

It defines the `CHAOS_KILL_COMMAND` ENV to set the chaos kill command.
Default values of `CHAOS_KILL_COMMAND` command:
- `CHAOS_KILL_COMMAND`: "kill $(find /proc -name exe -lname '*/dd' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}' | head -n 1)"

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-memory-hog-exec/kill-command.yaml yaml)
```yaml
# provide the chaos kill command used to kill the chaos process
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
  chaosServiceAccount: pod-memory-hog-exec-sa
  experiments:
  - name: pod-memory-hog-exec
    spec:
      components:
        env:
        # command to kill the dd process
        # alternative command: "kill -9 $(ps afx | grep \"[dd] if=/dev/zero\" | awk '{print $1}' | tr '\n' ' ')"
        - name: CHAOS_KILL_COMMAND
          value: "kill $(find /proc -name exe -lname '*/dd' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}' | head -n 1)"
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
