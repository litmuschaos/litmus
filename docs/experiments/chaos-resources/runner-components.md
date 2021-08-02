It contains all the chaos-runner tunables provided at `.spec.components.runner` inside chaosengine. 

### ChaosRunner Annotations

It allows developers to specify the custom annotations for the runner pod. It can be tuned via `runnerAnnotations` field. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-annotations.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-args-and-command.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-configmaps-and-secrets.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-image-and-pullPolicy.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-imagePullSecrets.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-nodeSelectors.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-resources.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/runner-components/runner-tolerations.yaml yaml)
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
