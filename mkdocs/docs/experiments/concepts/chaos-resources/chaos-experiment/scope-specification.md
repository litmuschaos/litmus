It contains scope and permissions details provided at `spec.definition.scope` and `spec.definition.permissions` respectively inside chaosexperiment.

??? info "View the scope specification schema" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.scope</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the scope of the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>Namespaced</code>, <code>Cluster</code></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i> (depends on experiment type)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.scope</code> specifies the scope of the experiment. It can be <code>Namespaced</code> scope for pod level experiments and <code>Cluster</code> for the experiments having a cluster wide impact.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.permissions</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the minimum permission to run the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: list)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.permissions</code> specify the minimum permission that is required to run the ChaosExperiment. It also helps to estimate the blast radius for the ChaosExperiment.</td>
    </tr>
    </table>

## Experiment Scope

It specifies the scope of the experiment. It can be `Namespaced` scope for pod level experiments and `Cluster` for the experiments having a cluster wide impact. It can be tuned via `scope` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-scope/scope.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
description:
  message: |
    Deletes a pod belonging to a deployment/statefulset/daemonset
kind: ChaosExperiment
metadata:
  name: pod-delete
  labels:
    name: pod-delete
    app.kubernetes.io/part-of: litmus
    app.kubernetes.io/component: chaosexperiment
    app.kubernetes.io/version: latest
spec:
  definition:
    # scope of the chaosexperiment
    scope: Namespaced
    permissions:
      - apiGroups:
          - ""
          - "apps"
          - "apps.openshift.io"
          - "argoproj.io"
          - "batch"
          - "litmuschaos.io"
        resources:
          - "deployments"
          - "jobs"
          - "pods"
          - "pods/log"
          - "replicationcontrollers"
          - "deployments"
          - "statefulsets"
          - "daemonsets"
          - "replicasets"
          - "deploymentconfigs"
          - "rollouts"
          - "pods/exec"
          - "events"
          - "chaosengines"
          - "chaosexperiments"
          - "chaosresults"
        verbs:
          - "create"
          - "list"
          - "get"
          - "patch"
          - "update"
          - "delete"
          - "deletecollection"
    image: "litmuschaos/go-runner:latest"
    imagePullPolicy: Always
    args:
    - -c
    - ./experiments -name pod-delete
    command:
    - /bin/bash
    env:

    - name: TOTAL_CHAOS_DURATION
      value: '15'

    - name: RAMP_TIME
      value: ''

    - name: FORCE
      value: 'true'

    - name: CHAOS_INTERVAL
      value: '5'

    - name: PODS_AFFECTED_PERC
      value: ''

    - name: LIB
      value: 'litmus'    

    - name: TARGET_PODS
      value: ''

    - name: SEQUENCE
      value: 'parallel'
      
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## Experiment Permissions

It specify the minimum permission that is required to run the ChaosExperiment. It also helps to estimate the blast radius for the ChaosExperiment. It can be tuned via `permissions` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-scope/permissions.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
description:
  message: |
    Deletes a pod belonging to a deployment/statefulset/daemonset
kind: ChaosExperiment
metadata:
  name: pod-delete
  labels:
    name: pod-delete
    app.kubernetes.io/part-of: litmus
    app.kubernetes.io/component: chaosexperiment
    app.kubernetes.io/version: latest
spec:
  definition:
    scope: Namespaced
    # permissions for the chaosexperiment
    permissions:
      - apiGroups:
          - ""
          - "apps"
          - "apps.openshift.io"
          - "argoproj.io"
          - "batch"
          - "litmuschaos.io"
        resources:
          - "deployments"
          - "jobs"
          - "pods"
          - "pods/log"
          - "replicationcontrollers"
          - "deployments"
          - "statefulsets"
          - "daemonsets"
          - "replicasets"
          - "deploymentconfigs"
          - "rollouts"
          - "pods/exec"
          - "events"
          - "chaosengines"
          - "chaosexperiments"
          - "chaosresults"
        verbs:
          - "create"
          - "list"
          - "get"
          - "patch"
          - "update"
          - "delete"
          - "deletecollection"
    image: "litmuschaos/go-runner:latest"
    imagePullPolicy: Always
    args:
    - -c
    - ./experiments -name pod-delete
    command:
    - /bin/bash
    env:

    - name: TOTAL_CHAOS_DURATION
      value: '15'

    - name: RAMP_TIME
      value: ''

    - name: FORCE
      value: 'true'

    - name: CHAOS_INTERVAL
      value: '5'

    - name: PODS_AFFECTED_PERC
      value: ''

    - name: LIB
      value: 'litmus'    

    - name: TARGET_PODS
      value: ''

    ## it defines the sequence of chaos execution for multiple target pods
    ## supported values: serial, parallel
    - name: SEQUENCE
      value: 'parallel'
      
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```
