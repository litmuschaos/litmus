It contains tunables to execute the `vm-poweroff` experiment. This experiment power off the vm matched by `APP_VM_MOID` vm moid. It restarts the vm after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common Experiment Tunables

Refer the [common attributes](../common/common.md) to tune the common tunables for all the experiments.

### Stop/Poweroff VM By MOID

It contains moid of the vm instance. It can be tuned via `APP_VM_MOID` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/vmware/vm-poweroff/app-vm-moid.yaml yaml)
```yaml
# power-off the vmware vm
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: vm-poweroff-sa
  experiments:
  - name: vm-poweroff
    spec:
      components:
        env:
        # moid of the vm instance
        - name: APP_VM_MOID
          value: 'vm-5365'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
