It contains tunables to execute the `gcp-vm-instance-stop` experiment. This experiment stops the given gcp instances and restarts them after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common Experiment Tunables

Refer the [common attributes](../common/common.md) to tune the common tunables for all the experiments.

### Target GCP Instances

It will stop all the instances with the given `VM_INSTANCE_NAMES` instance names and corresponding `INSTANCE_ZONES` zone names in `GCP_PROJECT_ID` project. 

`NOTE:` The `VM_INSTANCE_NAMES` contains multiple comma-separated vm instances. The comma-separated zone names should be provided in the same order as instance names.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/gcp/gcp-vm-instance-stop/gcp-instance.yaml yaml)
```yaml
## details of the gcp instance
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: gcp-vm-instance-stop-sa
  experiments:
  - name: gcp-vm-instance-stop
    spec:
      components:
        env:
        # comma separated list of vm instance names
        - name: VM_INSTANCE_NAMES
          value: 'instance-01,instance-02'
        # comma separated list of zone names corresponds to the VM_INSTANCE_NAMES
        # it should be provided in same order of VM_INSTANCE_NAMES
        - name: INSTANCE_ZONES
          value: 'zone-01,zone-02'
        # gcp project id to which vm instance belongs
        - name: GCP_PROJECT_ID
          value: 'project-id'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Autoscaling NodeGroup

If vm instances belong to the autoscaling group then provide the `AUTO_SCALING_GROUP` as `enable` else provided it as `disable`. The default value of `AUTO_SCALING_GROUP` is `disable`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/gcp/gcp-vm-instance-stop/auto-scaling.yaml yaml)
```yaml
## scale up and down to maintain the available instance counts
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: gcp-vm-instance-stop-sa
  experiments:
  - name: gcp-vm-instance-stop
    spec:
      components:
        env:
        # tells if instances are part of autoscaling group
        # supports: enable, disable. default: disable
        - name: AUTO_SCALING_GROUP
          value: 'enable'
        # comma separated list of vm instance names
        - name: VM_INSTANCE_NAMES
          value: 'instance-01,instance-02'
        # comma separated list of zone names corresponds to the VM_INSTANCE_NAMES
        # it should be provided in same order of VM_INSTANCE_NAMES
        - name: INSTANCE_ZONES
          value: 'zone-01,zone-02'
        # gcp project id to which vm instance belongs
        - name: GCP_PROJECT_ID
          value: 'project-id'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/gcp/gcp-vm-instance-stop/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: gcp-vm-instance-stop-sa
  experiments:
  - name: gcp-vm-instance-stop
    spec:
      components:
        env:
        # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
        - name: VM_INSTANCE_NAMES
          value: 'instance-01,instance-02'
        - name: INSTANCE_ZONES
          value: 'zone-01,zone-02'
        - name: GCP_PROJECT_ID
          value: 'project-id'
       
```
