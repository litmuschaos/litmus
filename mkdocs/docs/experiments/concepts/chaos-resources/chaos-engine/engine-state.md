It is a user-defined flag to trigger chaos. Setting it to `active` ensures the successful execution of chaos. Patching it with `stop` aborts ongoing experiments. It has a corresponding flag in the chaosengine status field, called `engineStatus` which is updated by the controller based on the actual state of the ChaosEngine.
It can be tuned via `engineState` field. It supports `active` and `stop` values.

??? info "View the state specification schema" 

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.engineState</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to control the state of the chaosengine</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Mandatory</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><code>active</code>, <code>stop</code></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><code>active</code></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>engineState</code> in the spec is a user defined flag to trigger chaos. Setting it to <code>active</code> ensures successful execution of chaos. Patching it with <code>stop</code> aborts ongoing experiments. It has a corresponding flag in the chaosengine status field, called <code>engineStatus</code> which is updated by the controller based on actual state of the ChaosEngine.</td>
    </tr>
    </table>

Use the following example to tune this:

[embedmd]:# (../chaos-engine/engine-spec/engine-state.yaml yaml)
```yaml
# contains the chaosengine state
# supports: active and stop states
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  # contains the state of engine
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```
