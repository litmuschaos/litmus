## GCP VM Disk Loss

It contains tunables to execute the `gcp-vm-disk-loss` experiment. It will detach all the disks with the given `DISK_VOLUME_NAMES` disk names and corresponding `DISK_ZONES` zone names and the `DEVICE_NAMES` device names in `GCP_PROJECT_ID` project.  It reattached the volume after waiting for the specified `TOTAL_CHAOS_DURATION` duration.

`NOTE:` The `DISK_VOLUME_NAMES` contains multiple comma-separated disk names. The comma-separated zone names should be provided in the same order as disk names.

Use the following example to tune this:
<references to the sample manifest>

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>
