It contains configuration details provided at `spec.definition` inside chaosexperiment

??? info "View the configuration specification schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.labels</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the label for the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.labels</code> allow developers to specify the ChaosPod label for an experiment. </td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.securityContext.podSecurityContext</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify security context for ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:corev1.PodSecurityContext)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.securityContext.podSecurityContext</code> allows the developers to specify the security context for the ChaosPod which applies to all containers inside the Pod.</td>
    </tr>
    </table>

     <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.securityContext.containerSecurityContext.privileged</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the security context for the ChaosExperiment pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>true, false</i> (type:bool)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.securityContext.containerSecurityContext.privileged</code> specify the securityContext params to the experiment container.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.configMaps</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the configmap for ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.configMaps</code> allows the developers to mount the ConfigMap volume into the experiment pod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.secrets</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the secrets for ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.secrets</code> specify the secret data to be passed for the ChaosPod. The secrets typically contains confidential information like credentials.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.experimentAnnotations</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the custom annotation to the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.experimentAnnotations</code> allows the developer to specify the Custom annotation for the chaos pod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.hostFileVolumes</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the host file volumes to the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.hostFileVolumes</code> allows the developer to specify the host file volumes to the ChaosPod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.hostPID</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the host PID for the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>true, false</i> (type:bool)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.hostPID</code> allows the developer to specify the host PID  for the ChaosPod. </td>
    </tr>
    </table>

## Labels

It allows developers to specify the ChaosPod label for an experiment. It can be tuned via `labels` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/labels.yaml yaml)

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
    # it contains experiment labels
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## PodSecurityContext

It allows the developers to specify the security context for the ChaosPod which applies to all containers inside the Pod. It can be tuned via `podSecurityContext` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/pod-security-context.yaml yaml)

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
    # it contains pod security context
    securityContext:
      podSecurityContext:
        allowPrivilegeEscalation: true
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## Container Security Context

It allows the developers to specify the security context for the container inside ChaosPod. It can be tuned via `containerSecurityContext` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/container-security-context.yaml yaml)

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
    # it contains container security context
    securityContext:
      containerSecurityContext:
        privileged: true
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## ConfigMaps

It allows the developers to mount the ConfigMap volume into the experiment pod. It can tuned via `configMaps` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/configmaps.yaml yaml)

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
    # it contains configmaps details
    configMaps:
      - name: experiment-data
        mountPath: "/mnt"
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## Secrets

It specify the secret data to be passed for the ChaosPod. The secrets typically contains confidential information like credentials. It can be tuned via `secret` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/secrets.yaml yaml)

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
    # it contains secret details
    secret:
      - name: auth-credentials
        mountPath: "/tmp"
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## Experiment Annotations

It allows the developer to specify the Custom annotation for the chaos pod. It can be tuned via `experimentAnnotations` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/experiment-annotations.yaml yaml)

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
    # it contains experiment annotations
    experimentAnnotations:
      context: chaos
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## Host File Volumes

It allows the developer to specify the host file volumes to the ChaosPod. It can be tuned via `hostFileVolumes` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/host-file-volumes.yaml yaml)

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
    # it contains host file volumes
    hostFileVolumes:
      - name: socket file
        mountPath: "/run/containerd/containerd.sock"
        nodePath: "/run/containerd/containerd.sock"
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```

## Host PID

It allows the developer to specify the host PID for the ChaosPod. It can be tuned via `hostPID` field.

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-configuration/host-pid.yaml yaml)

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
    # it allows hostPID
    hostPID: true
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```