## Annotation Check

It controls whether or not the operator checks for the annotation `litmuschaos.io/chaos` to be set against the application under test (AUT). Setting it to `true` ensures the check is performed, with chaos being skipped if the app is not annotated while setting it to `false` suppresses this check and proceeds with chaos injection.
It can be tuned via `annotationCheck` field. It supports the boolean value and the default value is `false`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/chaos-resources/engine-spec/annotation-check.yaml yaml)
```yaml
# checks the AUT for the annoations. The AUT should be annotated with `litmuschaos.io/chaos: true` if provided as true
# supports: true, false. default: false
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  # annotaionCheck details
  annotationCheck: "true"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
  
```

## Jobcleanup Policy

It controls whether or not the experiment pods are removed once execution completes. Set to `retain` for debug purposes (in the absence of standard logging mechanisms).
It can be tuned via `jobCleanupPolicy` fields. It supports `retain` and `delete`. The default value is `retain`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/chaos-resources/engine-spec/jobcleanup-policy.yaml yaml)
```yaml
# flag to delete or retain the chaos resources after completions of chaosengine
# supports: delete, retain. default: retain
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  jobCleanupPolicy: "delete"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
  
```

## Termination Grace Period Seconds

It controls the `terminationGracePeriodSeconds` for the chaos resources in the abort case. Chaos pods contain chaos revert upon abortion steps, which continuously looking for the termination signals. The `terminationGracePeriodSeconds` should be provided in such a way that the chaos pods got enough time for the revert before being completely terminated.
It can be tuned via `terminationGracePeriodSeconds` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/chaos-resources/engine-spec/terminationGracePeriod.yaml yaml)
```yaml
# contains flag to control the terminationGracePeriodSeconds for the chaos pod(abort case)
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  # contains terminationGracePeriodSeconds for the chaos pods
  terminationGracePeriodSeconds: 100
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete 
```
