It contains tunables, which are common for all pod-level experiments. These tunables can be provided at `.spec.experiment[*].spec.components.env` in chaosengine.

### Target Specific Pods

It defines the comma-separated name of the target pods subjected to chaos. The target pods can be tuned via `TARGET_PODS` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/common/target-pods.yaml yaml)
```yaml
## it contains comma separated target pod names
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
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        ## comma separated target pod names
        - name: TARGET_PODS
          value: 'pod1,pod2'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Pod Affected Percentage

It defines the percentage of pods subjected to chaos with matching labels provided at `.spec.appinfo.applabel` inside chaosengine. It can be tuned with `PODS_AFFECTED_PERC` ENV. If `PODS_AFFECTED_PERC` is provided as `empty` or `0` then it will target a minimum of one pod.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/common/pod-affected-percentage.yaml yaml)
```yaml
## it contains percentage of application pods to be targeted with matching labels or names in the application namespace
## supported for all pod-level experiment expect pod-autoscaler
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
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # percentage of application pods
        - name: PODS_AFFECTED_PERC
          value: '100'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Target Specific Container

It defines the name of the targeted container subjected to chaos. It can be tuned via `TARGET_CONTAINER` ENV. If `TARGET_CONTAINER` is provided as empty then it will use the first container of the targeted pod.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/common/target-container.yaml yaml)
```yaml
## name of the target container
## it will use first container as target container if TARGET_CONTAINER is provided as empty
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
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # name of the target container
        - name: TARGET_CONTAINER
          value: 'nginx'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Default Application Health Check

It defines the default application status checks as a tunable. It is helpful for the scenarios where you don’t want to validate the application status as a mandatory check during pre & post chaos. It can be tuned via `DEFAULT_APP_HEALTH_CHECK` ENV. If `DEFAULT_APP_HEALTH_CHECK` is not provided by default it is set to `true`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/common/default-app-health-check.yaml yaml)
```yaml
## application status check as tunable
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
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        - name: DEFAULT_APP_HEALTH_CHECK
          value: 'false'
```

### Node Label Filter For Selecting The Target Pods

It defines the target application pod selection from a specific node. It is helpful for the scenarios where you want to select the pods scheduled on specific nodes as chaos candidates considering the pod affected percentage. It can be tuned via `NODE_LABEL` ENV.

<b>NOTE: This feature requires having node-level permission or clusterrole service account for filtering pods on a specific node.</b>


<table>
  <tr>
    <th>APP_LABEL</th>
    <th>TARGET_PODS</th>
    <th>NODE_LABEL</th>
    <th>SELECTED PODS</th>
  </tr>
  <tr>
    <td>Provided</td>
    <td>Provided</td>
    <td>Provided</td>
    <td>The target pods that are filtered from applabel and resides on node containing the given node label and also provided in TARGET_PODS env is selected</td>
  </tr>
   <tr>
    <td>Provided</td>
    <td>Not Provided</td>
    <td>Provided</td>
    <td>The pods that are filtered from applabel and resides on node containing the given node label is selected </td>
  </tr>
   <tr>
    <td>Not Provided</td>
    <td>Provided</td>
    <td>Provided</td>
    <td>The target pods are selected that resides on node with given node label </td>
  </tr>
    </tr>
   <tr>
    <td>Not Provided</td>
    <td>Not Provided</td>
    <td>Provided</td>
    <td>Invalid</td>
  </tr>
   <tr>
    <td>Not Provided</td>
    <td>Not Provided</td>
    <td>Not Provided</td>
    <td>Invalid</td>
  </tr>
</table>

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/common/node-label-filter.yaml yaml)
```yaml
## node label to filter target pods
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
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        - name: NODE_LABEL
          value: 'kubernetes.io/hostname=worker-01'
```
