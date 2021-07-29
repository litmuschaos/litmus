## Common Tunables For All Experiments

It contains tunables, which are common for all the experiments. These tunables can be provided at `.spec.experiment[*].spec.components.env` in chaosengine.

### Duration of the chaos

It defines the total time duration of the chaos injection. It can be tuned with the `TOTAL_CHAOS_DURATION` ENV. It is provided in a unit of seconds.

Use the following example to tune this:
<references to the sample manifest>

### Ramp Time

It defines the period to wait before and after the injection of chaos. It can be tuned with the `RAMP_TIME` ENV. It is provided in a unit of seconds.

Use the following example to tune this:
<references to the sample manifest>

### Sequence of chaos execution

It defines the sequence of the chaos execution in the case of multiple targets. It can be tuned with the `SEQUENCE` ENV. It supports the following modes:
- `parallel`: The chaos is injected in all the targets at once.
- `serial`: The chaos is injected in all the targets one by one.
The default value of `SEQUENCE` is `parallel`.

Use the following example to tune this:
<references to the sample manifest>

### Name of chaos library

It defines the name of the chaos library used for the chaos injection. It can be tuned with the `LIB` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Instance ID

It defines a user-defined string that holds metadata/info about the current run/instance of chaos. Ex: 04-05-2020-9-00. This string is appended as a suffix in the chaosresult CR name. It can be tuned with `INSTANCE_ID` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Image used by the helper pod

It defines the image, which is used to launch the helper pod, if applicable. It can be tuned with the `LIB_IMAGE` ENV.
It is supported by [container-kill, network-experiments, stress-experiments, dns-experiments, disk-fill, kubelet-service-kill, docker-service-kill, node-restart] experiments.

Use the following example to tune this:
<references to the sample manifest>
