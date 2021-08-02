It contains tunables to execute the `gcp-vm-disk-loss` experiment. It will detach all the disks matched by disk names.  It reattached the disks after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

### Common Experiment Tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) to tune the common tunables for all the experiments.

### Detach Volumes By Names

It contains comma separated list of volume names subjected to disk loss chaos. It will detach all the disks with the given `DISK_VOLUME_NAMES` disk names and corresponding `DISK_ZONES` zone names and the `DEVICE_NAMES` device names in `GCP_PROJECT_ID` project.  It reattached the volume after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

`NOTE:` The `DISK_VOLUME_NAMES` contains multiple comma-separated disk names. The comma-separated zone names should be provided in the same order as disk names.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/gcp/gcp-vm-disk-loss/gcp-disk-loss.yaml yaml)
```yaml
## details of the gcp disk
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: gcp-vm-disk-loss-sa
  experiments:
  - name: gcp-vm-disk-loss
    spec:
      components:
        env:
        # comma separated list of disk volume names
        - name: DISK_VOLUME_NAMES
          value: 'disk-01,disk-02'
        # comma separated list of zone names corresponds to the DISK_VOLUME_NAMES
        # it should be provided in same order of DISK_VOLUME_NAMES
        - name: DISK_ZONES
          value: 'zone-01,zone-02'
        # comma separated list of device names corresponds to the DISK_VOLUME_NAMES
        # it should be provided in same order of DISK_VOLUME_NAMES
        - name: DEVICE_NAMES
          value: 'device-01,device-02'
        # gcp project id to which disk volume belongs
        - name: GCP_PROJECT_ID
          value: 'project-id'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/gcp/gcp-vm-disk-loss/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: gcp-vm-disk-loss-sa
  experiments:
  - name: gcp-vm-disk-loss
    spec:
      components:
        env:
        # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
        - name: DISK_VOLUME_NAMES
          value: 'disk-01,disk-02'
        - name: DISK_ZONES
          value: 'zone-01,zone-02'
        - name: DEVICE_NAMES
          value: 'device-01,device-02'
        - name: GCP_PROJECT_ID
          value: 'project-id'
        
```
