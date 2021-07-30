## Experiment Tunables

It contains all the experiment tunables provided at `.spec.experiments[].spec.components` inside chaosengine. 

### Experiment Annotations

It allows developers to specify the custom annotations for the experiment pod. It can be tuned via `experimentAnnotations` field. 

Use the following example to tune this:
<references to the sample manifest>

### Experiment Configmaps And Secrets

It defines the `configMaps` and `secrets` to set the configmaps and secrets mounted to the experiment pod respectively.
- `configMaps`: It provides for a means to insert config information into the experiment. The configmaps definition is validated for the correctness and those specified are checked for availability (in the cluster/namespace) before being mounted into the experiment pods.
- `secrets`: It provides for a means to push secrets (typically project ids, access credentials, etc.,) into the experiment pods. These are especially useful in the case of platform-level/infra-level chaos experiments. The secrets definition is validated for the correctness and those specified are checked for availability (in the cluster/namespace) before being mounted into the experiment pods.

Use the following example to tune this:
<references to the sample manifest>

### Experiment Image

It overrides the experiment image for the chaosexperiment. It allows developers to specify the experiment image. It can be tuned via `experimentImage` field. 

Use the following example to tune this:
<references to the sample manifest>

### Experiment ImagePullSecrets

It allows developers to specify the imagePullSecret name for ChaosExperiment. It can be tuned via `experimentImagePullSecrets` field.

Use the following example to tune this:
<references to the sample manifest>

### Experiment NodeSelectors

The nodeselector contains labels of the node on which experiment pod should be scheduled. Typically used in case of infra/node level chaos. It can be tuned via `nodeSelector` field.

Use the following example to tune this:
<references to the sample manifest>

### Experiment Resource Requirements

It contains the resource requirements for the ChaosExperiment Pod, where we can provide resource requests and limits for the pod. It can be tuned via `resources` field.

Use the following example to tune this:
<references to the sample manifest>

### Experiment Tolerations

It provides tolerations for the experiment pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos. It can be tuned via `tolerations` field.

Use the following example to tune this:
<references to the sample manifest>

### Experiment Status Check Timeout

It overrides the status timeouts inside chaosexperiments. It contains timeout & delay in seconds. It can be tuned via `statusCheckTimeouts` field. 

Use the following example to tune this:
<references to the sample manifest>
