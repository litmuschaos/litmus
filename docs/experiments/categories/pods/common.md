## Common Tunables For Pod Experiments

It contains tunables, which are common for all pod-level experiments. These tunables can be provided at `.spec.experiment[*].spec.components.env` in chaosengine.

### Target Specific Pods

It defines the comma-separated name of the target pods subjected to chaos. The target pods can be tuned via `TARGET_PODS` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Pod Affected Percentage

It defines the percentage of pods subjected to chaos with matching labels provided at `.spec.appinfo.applabel` inside chaosengine. It can be tuned with `PODS_AFFECTED_PERC` ENV. If `PODS_AFFECTED_PERC` is provided as `empty` or `0` then it will target a minimum of one pod.

Use the following example to tune this:
<references to the sample manifest>

### Target Specific Container

It defines the name of the targeted container subjected to chaos. It can be tuned via `TARGET_CONTAINER` ENV. If `TARGET_CONTAINER` is provided as empty then it will use the first container of the targeted pod.

Use the following example to tune this:
<references to the sample manifest>