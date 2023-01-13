It contains all the chaos-runner tunables provided at `.spec.components.runner` inside chaosengine.

??? info "View the runner specification schema"

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.image</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify image of ChaosRunner pod</td>
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
      <td><i>n/a</i> (refer <i>Notes</i>)</td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.image</code> allows developers to specify their own debug runner images. Defaults for the runner image can be enforced via the operator env <b>CHAOS_RUNNER_IMAGE</b></td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.imagePullPolicy</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify imagePullPolicy for the ChaosRunner</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><code>Always</code>, <code>IfNotPresent</code></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><code>IfNotPresent</code></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.imagePullPolicy</code> allows developers to specify the pull policy for chaos-runner. Set to <code>Always</code> during debug/test.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.imagePullSecrets</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify imagePullSecrets for the ChaosRunner</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: []corev1.LocalObjectReference)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.imagePullSecrets</code> allows developers to specify the <code>imagePullSecret</code> name for ChaosRunner. </td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.runnerAnnotations</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Annotations that needs to be provided in the pod which will be created (runner-pod)</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td> <i>user-defined</i> (type: map[string]string) </td>
    </tr>
    <tr>
      <th>Default</th>
      <td> n/a </td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.runnerAnnotation</code> allows developers to specify the custom annotations for the runner pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.args</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the args for the ChaosRunner Pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><i>user-defined</i> (type: []string)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.args</code> allows developers to specify their own debug runner args.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.command</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the commands for the ChaosRunner Pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><i>user-defined</i> (type: []string)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.command</code> allows developers to specify their own debug runner commands.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.configMaps</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Configmaps passed to the chaos runner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, mountPath: string})</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.configMaps</code> provides for a means to insert config information into the runner pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.secrets</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Kubernetes secrets passed to the chaos runner pod.</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, mountPath: string})</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.secrets</code> provides for a means to push secrets (typically project ids, access credentials etc.,) into the chaos runner pod. These are especially useful in case of platform-level/infra-level chaos experiments. </td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.nodeSelector</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Node selectors for the runner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td>Labels in the from of label key=value</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.nodeSelector</code> The nodeselector contains labels of the node on which runner pod should be scheduled. Typically used in case of infra/node level chaos.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.resources</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the resource requirements for the ChaosRunner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: corev1.ResourceRequirements)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.resources</code> contains the resource requirements for the ChaosRunner Pod, where we can provide resource requests and limits for the pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.tolerations</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Toleration for the runner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: []corev1.Toleration)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.tolerations</code> Provides tolerations for the runner pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos.</td>
    </tr>
    </table>

### ChaosRunner Annotations

It allows developers to specify the custom annotations for the runner pod. It can be tuned via `runnerAnnotations` field.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-annotations.yaml yaml)
```yaml
# contains annotations for the chaos runner pod
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
     # annotations for the chaos-runner
     runnerAnnotations:
       name: chaos-runner
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner Args And Command

It defines the `args` and `command` to set the args and command of the chaos-runner respectively.

- `args`: It allows developers to specify their own debug runner args.
- `command`: It allows developers to specify their own debug runner commands.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-args-and-command.yaml yaml)
```yaml
# contains args and command for the chaos runner
# it will be useful for the cases where custom image of the chaos-runner is used, which supports args and commands
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    # override the args and command for the chaos-runner
    runner:
      # name of the custom image
      image: "<your repo>/chaos-runner:ci"
      # args for the image
      args:
      - "/bin/sh"
      # command for the image
      command:
      - "-c"
      - "<custom-command>"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner Configmaps And Secrets

It defines the `configMaps` and `secrets` to set the configmaps and secrets mounted to the chaos-runner respectively.

- `configMaps`: It provides for a means to insert config information into the runner pod.
- `secrets`: It provides for a means to push secrets (typically project ids, access credentials, etc.,) into the chaos runner pod. These are especially useful in the case of platform-level/infra-level chaos experiments.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-configmaps-and-secrets.yaml yaml)
```yaml
# contains configmaps and secrets for the chaos-runner
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
     # configmaps details mounted to the runner pod
     configMaps:
     - name: "configmap-01"
       mountPath: "/mnt"
     # secrets details mounted to the runner pod
     secrets:
     - name: "secret-01"
       mountPath: "/tmp"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner Image and ImagePullPoicy

It defines the `image` and `imagePullPolicy` to set the image and imagePullPolicy for the chaos-runner respectively.

- `image`: It allows developers to specify their own debug runner images. Defaults for the runner image can be enforced via the operator env `CHAOS_RUNNER_IMAGE`.
- `imagePullPolicy`: It allows developers to specify the pull policy for chaos-runner. Set to Always during debug/test.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-image-and-pullPolicy.yaml yaml)
```yaml
# contains the image and imagePullPolicy of the chaos-runner
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
      # override the image of the chaos-runner
      # by default it is used the image based on the litmus version
      image: "litmuschaos/chaos-runner:latest"
      # imagePullPolicy for the runner image
      # supports: Always, IfNotPresent. default: IfNotPresent
      imagePullPolicy: "Always"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner ImagePullSecrets

It allows developers to specify the imagePullSecret name for the ChaosRunner. It can be tuned via `imagePullSecrets` field.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-imagePullSecrets.yaml yaml)
```yaml
# contains the imagePullSecrets for the chaos-runner
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
      # secret name for the runner image, if using private registry
      imagePullSecrets:
      - name: regcred
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner NodeSelectors

The nodeselector contains labels of the node on which runner pod should be scheduled. Typically used in case of infra/node level chaos. It can be tuned via `nodeSelector` field.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-nodeSelectors.yaml yaml)
```yaml
# contains the node-selector for the chaos-runner
# it will schedule the chaos-runner on the coresponding node with matching labels
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
      # nodeselector for the runner pod
      nodeSelector:
        context: chaos
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner Resource Requirements

It contains the resource requirements for the ChaosRunner Pod, where we can provide resource requests and limits for the pod. It can be tuned via `resources` field.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-resources.yaml yaml)
```yaml
# contains the resource requirements for the runner pod
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
      # resource requirements for the runner pod
      resources:
        requests:
          cpu: "250m"
          memory: "64Mi"
        limits:
         cpu: "500m"
         memory: "128Mi"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```

### ChaosRunner Tolerations

It provides tolerations for the runner pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos. It can be tuned via `tolerations` field.

Use the following example to tune this:

[embedmd]:# (../chaos-engine/runner-components/runner-tolerations.yaml yaml)
```yaml
# contains the tolerations for the chaos-runner
# it will schedule the chaos-runner on the tainted node
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  components:
    runner:
      # tolerations for the runner pod
      tolerations:
      - key: "key1"
        operator: "Equal"
        value: "value1"
        effect: "Schedule"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
```
