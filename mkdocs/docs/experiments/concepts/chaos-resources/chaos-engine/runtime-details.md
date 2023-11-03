It contains runtime details of the chaos experiments provided at `.spec` inside chaosengine.

??? info "View the runtime specification schema"

    <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.annotationCheck</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to control annotationChecks on applications as prerequisites for chaos</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><code>true</code>, <code>false</code></td>
      </tr>
      <tr>
        <th>Default</th>
        <td><code>true</code></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>annotationCheck</code> in the spec controls whether or not the operator checks for the annotation "litmuschaos.io/chaos" to be set against the application under test (AUT). Setting it to <code>true</code> ensures the check is performed, with chaos being skipped if the app is not annotated, while setting it to <code>false</code> suppresses this check and proceeds with chaos injection.</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.terminationGracePeriodSeconds</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to control terminationGracePeriodSeconds for the chaos pods(abort case)</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td>integer value</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><code>30</code></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>terminationGracePeriodSeconds</code> in the spec controls the terminationGracePeriodSeconds for the chaos resources in abort case. Chaos pods contains chaos revert upon abortion steps, which continuously looking for the termination signals. The terminationGracePeriodSeconds should be provided in such a way that the chaos pods got enough time for the revert before completely terminated.</td>
      </tr>
      </table>


      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.jobCleanUpPolicy</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to control cleanup of chaos experiment job post execution of chaos</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><code>delete</code>, <code>retain</code></td>
      </tr>
      <tr>
        <th>Default</th>
        <td><code>delete</code></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td><The <code>jobCleanUpPolicy</code> controls whether or not the experiment pods are removed once execution completes. Set to <code>retain</code> for debug purposes (in the absence of standard logging mechanisms).</td>
      </tr>
    </table>

## Annotation Check

It controls whether or not the operator checks for the annotation `litmuschaos.io/chaos` to be set against the application under test (AUT). Setting it to `true` ensures the check is performed, with chaos being skipped if the app is not annotated while setting it to `false` suppresses this check and proceeds with chaos injection.
It can be tuned via `annotationCheck` field. It supports the boolean value and the default value is `false`.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/engine-spec/annotation-check.yaml yaml)
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
It can be tuned via `jobCleanUpPolicy` fields. It supports `retain` and `delete`. The default value is `retain`.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/engine-spec/jobcleanup-policy.yaml yaml)
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
  jobCleanUpPolicy: "delete"
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

[embedmd]:# (../chaos-engine/engine-spec/terminationGracePeriod.yaml yaml)
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
