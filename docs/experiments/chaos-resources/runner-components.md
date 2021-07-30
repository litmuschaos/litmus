## Chaos Runner Tunables

It contains all the chaos-runner tunables provided at `.spec.components.runner` inside chaosengine. 

### ChaosRunner Annotations

It allows developers to specify the custom annotations for the runner pod. It can be tuned via `runnerAnnotations` field. 

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner Args And Command

It defines the `args` and `command` to set the args and command of the chaos-runner respectively.
- `args`: It allows developers to specify their own debug runner args.
- `command`: It allows developers to specify their own debug runner commands.

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner Configmaps And Secrets

It defines the `configMaps` and `secrets` to set the configmaps and secrets mounted to the chaos-runner respectively.
- `configMaps`: It provides for a means to insert config information into the runner pod.
- `secrets`: It provides for a means to push secrets (typically project ids, access credentials, etc.,) into the chaos runner pod. These are especially useful in the case of platform-level/infra-level chaos experiments.

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner Image and ImagePullPoicy

It defines the `image` and `imagePullPolicy` to set the image and imagePullPolicy for the chaos-runner respectively.
- `image`: It allows developers to specify their own debug runner images. Defaults for the runner image can be enforced via the operator env `CHAOS_RUNNER_IMAGE`. 
- `imagePullPolicy`: It allows developers to specify the pull policy for chaos-runner. Set to Always during debug/test.

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner ImagePullSecrets

It allows developers to specify the imagePullSecret name for the ChaosRunner. It can be tuned via `imagePullSecrets` field.

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner NodeSelectors

The nodeselector contains labels of the node on which runner pod should be scheduled. Typically used in case of infra/node level chaos. It can be tuned via `nodeSelector` field.

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner Resource Requirements

It contains the resource requirements for the ChaosRunner Pod, where we can provide resource requests and limits for the pod. It can be tuned via `resources` field.

Use the following example to tune this:
<references to the sample manifest>

### ChaosRunner Tolerations

It provides tolerations for the runner pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos. It can be tuned via `tolerations` field.

Use the following example to tune this:
<references to the sample manifest>
