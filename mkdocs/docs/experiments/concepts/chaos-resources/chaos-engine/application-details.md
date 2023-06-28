It contains AUT and auxiliary applications details provided at `spec.appinfo` and `spec.auxiliaryAppInfo` respectively inside chaosengine.

??? info "View the application specification schema"

    <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.appinfo.appns</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify namespace of application under test</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
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
        <td>The <code>appns</code> in the spec specifies the namespace of the AUT. Usually provided as a quoted string. It is optional for the infra chaos.</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.appinfo.applabel</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify unique label of application under test</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)(pattern: "label_key=label_value")</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>applabel</code> in the spec specifies a unique label of the AUT. Usually provided as a quoted string of pattern key=value. Note that if multiple applications share the same label within a given namespace, the AUT is filtered based on the presence of the chaos annotation <code>litmuschaos.io/chaos: "true"</code>. If, however, the <code>annotationCheck</code> is disabled, then a random application (pod) sharing the specified label is selected for chaos. It is optional for the infra chaos.</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.appinfo.appkind</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify resource kind of application under test</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><code>deployment</code>, <code>statefulset</code>, <code>daemonset</code>, <code>deploymentconfig</code>, <code>rollout</code></td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i> (depends on app type)</td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>appkind</code> in the spec specifies the Kubernetes resource type of the app deployment. The Litmus ChaosOperator supports chaos on deployments, statefulsets and daemonsets. Application health check routines are dependent on the resource types, in case of some experiments. It is optional for the infra chaos</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.auxiliaryAppInfo</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify one or more app namespace-label pairs whose health is also monitored as part of the chaos experiment, in addition to a primary application specified in the <code>.spec.appInfo</code>. <b>NOTE</b>: If the auxiliary applications are deployed in namespaces other than the AUT, ensure that the chaosServiceAccount is bound to a cluster role and has adequate permissions to list pods on other namespaces. </td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)(pattern: "namespace:label_key=label_value").</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>auxiliaryAppInfo</code> in the spec specifies a (comma-separated) list of namespace-label pairs for downstream (dependent) apps of the primary app specified in <code>.spec.appInfo</code> in case of pod-level chaos experiments. In case of infra-level chaos experiments, this flag specifies those apps that may be directly impacted by chaos and upon which health checks are necessary.</td>
      </tr>
      </table>

## Application Under Test

It defines the `appns`, `applabel`, and `appkind` to set the namespace, labels, and kind of the application under test.

- `appkind`: It supports `deployment`, `statefulset`, `daemonset`, `deploymentconfig`, and `rollout`.
It is mandatory for the pod-level experiments and optional for the rest of the experiments.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/engine-spec/app-info.yaml yaml)
```yaml
# contains details of the AUT(application under test)
# appns: name of the application
# applabel: label of the applicaton
# appkind: kind of the application. supports: deployment, statefulset, daemonset, rollout, deploymentconfig
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  # AUT details
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

## Auxiliary Application Info

The contains a (comma-separated) list of namespace-label pairs for downstream (dependent) apps of the primary app specified in `.spec.appInfo` in case of pod-level chaos experiments. In the case of infra-level chaos experiments, this flag specifies those apps that may be directly impacted by chaos and upon which health checks are necessary.
It can be tuned via `auxiliaryAppInfo` field. It supports input the below format:

- `auxiliaryAppInfo`: `<namespace1>:<key1=value1>,<namespace2>:<key2=value2>`

*Note*: Auxiliary application check is only supported for node-level experiments.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/engine-spec/auxiliary-appinfo.yaml yaml)
```yaml
# contains the comma seperated list of auxiliary applications details
# it is provide in `<namespace1>:<key1=value1>,<namespace2>:<key2=value2>` format
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  # provide the comma separated auxiliary applications details
  auxiliaryAppInfo: "nginx:app=nginx,default:app=busybox"
  chaosServiceAccount: node-drain-sa
  experiments:
  - name: node-drain
    spec:
      components:
        env:
        # name of the target node
        - name: TARGET_NODE
          value: 'node01'
```
