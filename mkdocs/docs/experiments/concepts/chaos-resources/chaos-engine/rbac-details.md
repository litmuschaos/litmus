It specifies the name of the serviceaccount mapped to a role/clusterRole with enough permissions to execute the desired chaos experiment. The minimum permissions needed for any given experiment are provided in the `.spec.definition.permissions` field of the respective chaosexperiment CR.
It can be tuned via `chaosServiceAccount` field.

??? info "View the RBAC specification schema"
    <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.chaosServiceAccount</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify serviceaccount used for chaos experiment</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Mandatory</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>chaosServiceAccount</code> in the spec specifies the name of the serviceaccount mapped to a role/clusterRole with enough permissions to execute the desired chaos experiment. The minimum permissions needed for any given experiment is provided in the <code>.spec.definition.permissions</code> field of the respective <b>chaosexperiment</b> CR.</td>
      </tr>
    </table>

Use the following example to tune this:

[embedmd]:# (../chaos-engine/engine-spec/service-account.yaml yaml)
```yaml
# contains name of the serviceAccount which contains all the RBAC permissions required for the experiment
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  # name of the service account w/ sufficient permissions
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```
