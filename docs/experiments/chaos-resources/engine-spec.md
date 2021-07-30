## ChaosEngine Spec Tunables

It contains all the tunables provided at `.spec` inside chaosengine. 

### Application Under Test

It defines the `appns`, `applabel`, and `appkind` to set the namespace, labels, and kind of the application under test.
- `appkind`: It supports `deployment`, `statefulset`, `daemonset`, `deploymentconfig`, and `rollout`. 
It is mandatory for the pod-level experiments and optional for the rest of the experiments.

Use the following example to tune this:
<references to the sample manifest>

### Annotation Check

It controls whether or not the operator checks for the annotation `litmuschaos.io/chaos` to be set against the application under test (AUT). Setting it to `true` ensures the check is performed, with chaos being skipped if the app is not annotated while setting it to `false` suppresses this check and proceeds with chaos injection.
It can be tuned via `annotationCheck` field. It supports the boolean value and the default value is `false`.

Use the following example to tune this:
<references to the sample manifest>

### Auxiliary Application Info

The contains a (comma-separated) list of namespace-label pairs for downstream (dependent) apps of the primary app specified in `.spec.appInfo` in case of pod-level chaos experiments. In the case of infra-level chaos experiments, this flag specifies those apps that may be directly impacted by chaos and upon which health checks are necessary.
It can be tuned via `auxiliaryAppInfo` field. It supports input the below format:
- `auxiliaryAppInfo`: `<key1>=<value1>:<namespace1>,<key2>=<value2>:<namespace2>` 

Use the following example to tune this:
<references to the sample manifest>

### ChaosEngine State

It is a user-defined flag to trigger chaos. Setting it to `active` ensures the successful execution of chaos. Patching it with `stop` aborts ongoing experiments. It has a corresponding flag in the chaosengine status field, called `engineStatus` which is updated by the controller based on the actual state of the ChaosEngine.
It can be tuned via `engineState` field. It supports `active` and `stop` values. 

Use the following example to tune this:
<references to the sample manifest>

### Jobcleanup Policy

It controls whether or not the experiment pods are removed once execution completes. Set to `retain` for debug purposes (in the absence of standard logging mechanisms).
It can be tuned via `jobCleanupPolicy` fields. It supports `retain` and `delete`. The default value is `retain`.

Use the following example to tune this:
<references to the sample manifest>

### Service Account Name

It specifies the name of the serviceaccount mapped to a role/clusterRole with enough permissions to execute the desired chaos experiment. The minimum permissions needed for any given experiment are provided in the `.spec.definition.permissions` field of the respective chaosexperiment CR.
It can be tuned via `chaosServiceAccount` field.

Use the following example to tune this:
<references to the sample manifest>

### Termination Grace Period Seconds

It controls the `terminationGracePeriodSeconds` for the chaos resources in the abort case. Chaos pods contain chaos revert upon abortion steps, which continuously looking for the termination signals. The `terminationGracePeriodSeconds` should be provided in such a way that the chaos pods got enough time for the revert before being completely terminated.
It can be tuned via `terminationGracePeriodSeconds` field.

Use the following example to tune this:
<references to the sample manifest>
