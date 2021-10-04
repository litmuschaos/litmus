It contains component details provided at `spec.definition` inside chaosexperiment

??? info "View the component specification schema" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.image</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the image to run the ChaosExperiment </td>
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
    <td><i>n/a</i> (refer Notes)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.image</code> allows the developers to specify their experiment images. Typically set to the Litmus <code>go-runner</code> or the <code>ansible-runner</code>. This feature of the experiment enables BYOC (BringYourOwnChaos), where developers can implement their own variants of a standard chaos experiment</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.imagePullPolicy</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag that helps the developers to specify imagePullPolicy for the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>IfNotPresent</code>, <code>Always</code> (type: string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><code>Always</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.imagePullPolicy</code> allows developers to specify the pull policy for ChaosExperiment image. Set to <code>Always</code> during debug/test</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.args</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the entrypoint for the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type:list of string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.args</code> specifies the entrypoint for the ChaosExperiment. It depends on the language used in the experiment. For litmus-go the <code>.spec.definition.args</code> contains a single binary of all experiments and managed via <code>-name</code> flag to indicate experiment to run(<code>-name (exp-name)</code>).</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.command</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the shell on which the ChaosExperiment will execute</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: list of string).</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><code>/bin/bash</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.command</code> specifies the shell used to run the experiment <code>/bin/bash</code> is the most common shell to be used.</td>
    </tr>
    </table>

## Image

It allows the developers to specify their experiment images. Typically set to the Litmus go-runner or the ansible-runner. This feature of the experiment enables BYOC (BringYourOwnChaos), where developers can implement their own variants of a standard chaos experiment. It can be tuned via `image` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-component/image.yaml yaml)

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
    # image of the chaosexperiment
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

## ImagePullPolicy

It allows developers to specify the pull policy for ChaosExperiment image. Set to Always during debug/test. It can be tuned via `imagePullPolicy` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-component/imagePullPolicy.yaml yaml)
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
    # imagePullPolicy of the chaosexperiment
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

## Args

It specifies the entrypoint for the ChaosExperiment. It depends on the language used in the experiment. For litmus-go the .spec.definition.args contains a single binary of all experiments and managed via -name flag to indicate experiment to run(-name (exp-name)). It can be tuned via `args` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-component/args.yaml yaml)

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
    # it contains args of the experiment
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

## Command

It specifies the shell used to run the experiment /bin/bash is the most common shell to be used. It can be tuned via `command` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-component/command.yaml yaml)

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
    # it contains command of the experiment
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