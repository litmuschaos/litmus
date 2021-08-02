It contains tunables to execute the `pod-cpu-hog-exec` experiment. This experiment stresses the cpu of the given pod for the specified `TOTAL_CHAOS_DURATION` duration. 

### Common and Pod specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Pod specific tunable](common-tunables-for-pod-experiments.md) to tune the common tunables for all experiments and pod specific tunables. 

### CPU Cores

It stresses the `CPU_CORE` cpu cores of the targeted pod for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-cpu-hog-exec/cpu-cores.yaml yaml)
```yaml
# cpu cores for the stress
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
  chaosServiceAccount: pod-cpu-hog-exec-sa
  experiments:
  - name: pod-cpu-hog-exec
    spec:
      components:
        env:
        # cpu cores for stress
        - name: CPU_CORES
          value: '1'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Chaos Inject and Kill Commands

It defines the `CHAOS_INJECT_COMMAND` and `CHAOS_KILL_COMMAND` ENV to set the chaos inject and chaos kill commands respectively.
Default values of commands:
- `CHAOS_INJECT_COMMAND`: "md5sum /dev/zero"
- `CHAOS_KILL_COMMAND`: "kill $(find /proc -name exe -lname '*/md5sum' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}')"

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/pods/pod-cpu-hog-exec/inject-and-kill-commands.yaml yaml)
```yaml
# provide the chaos kill, used to kill the chaos process
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
  chaosServiceAccount: pod-cpu-hog-exec-sa
  experiments:
  - name: pod-cpu-hog-exec
    spec:
      components:
        env:
        # command to create the md5sum process to stress the cpu
        - name: CHAOS_INJECT_COMMAND
          value: 'md5sum /dev/zero'
        # command to kill the md5sum process
        # alternative command: "kill -9 $(ps afx | grep \"[md5sum] /dev/zero\" | awk '{print$1}' | tr '\n' ' ')"
        - name: CHAOS_KILL_COMMAND
          value: "kill $(find /proc -name exe -lname '*/md5sum' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}')"
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
