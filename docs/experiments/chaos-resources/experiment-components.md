It contains all the experiment tunables provided at `.spec.experiments[].spec.components` inside chaosengine. 

### Experiment Annotations

It allows developers to specify the custom annotations for the experiment pod. It can be tuned via `experimentAnnotations` field. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-annotations.yaml yaml)
```yaml
# contains annotations for the chaos runner pod
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
        # annotations for the experiment pod
        experimentAnnotations:
          name: chaos-experiment
    
```

### Experiment Configmaps And Secrets

It defines the `configMaps` and `secrets` to set the configmaps and secrets mounted to the experiment pod respectively.
- `configMaps`: It provides for a means to insert config information into the experiment. The configmaps definition is validated for the correctness and those specified are checked for availability (in the cluster/namespace) before being mounted into the experiment pods.
- `secrets`: It provides for a means to push secrets (typically project ids, access credentials, etc.,) into the experiment pods. These are especially useful in the case of platform-level/infra-level chaos experiments. The secrets definition is validated for the correctness and those specified are checked for availability (in the cluster/namespace) before being mounted into the experiment pods.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-configmaps-and-secrets.yaml yaml)
```yaml
# contains configmaps and secrets for the experiment pod
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
        # configmaps details mounted to the experiment pod
        configMaps:
        - name: "configmap-01"
          mountPath: "/mnt"
        # secrets details mounted to the experiment pod
        secrets:
        - name: "secret-01"
          mountPath: "/tmp"
  
```

### Experiment Image

It overrides the experiment image for the chaosexperiment. It allows developers to specify the experiment image. It can be tuned via `experimentImage` field. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-image.yaml yaml)
```yaml
# contains the custom image for the experiment pod
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
        # override the image of the experiment pod
        experimentImage: "litmuschaos/go-runner:ci"
  
```

### Experiment ImagePullSecrets

It allows developers to specify the imagePullSecret name for ChaosExperiment. It can be tuned via `experimentImagePullSecrets` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-imagePullSecrets.yaml yaml)
```yaml
# contains the imagePullSecrets for the experiment pod
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
        # secret name for the experiment image, if using private registry
        imagePullSecrets:
        - name: regcred

  
```

### Experiment NodeSelectors

The nodeselector contains labels of the node on which experiment pod should be scheduled. Typically used in case of infra/node level chaos. It can be tuned via `nodeSelector` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-nodeSelectors.yaml yaml)
```yaml
# contains the node-selector for the experiment pod
# it will schedule the experiment pod on the coresponding node with matching labels
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
        # nodeselector for the experiment pod
        nodeSelector:
          context: chaos
  
```

### Experiment Resource Requirements

It contains the resource requirements for the ChaosExperiment Pod, where we can provide resource requests and limits for the pod. It can be tuned via `resources` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-resources.yaml yaml)
```yaml
# contains the resource requirements for the experiment pod
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
        # resource requirements for the experiment pod
        resources:
          requests:
            cpu: "250m"
            memory: "64Mi"
          limits:
          cpu: "500m"
          memory: "128Mi"
  
```

### Experiment Tolerations

It provides tolerations for the experiment pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos. It can be tuned via `tolerations` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-tolerations.yaml yaml)
```yaml
# contains the tolerations for the experiment pod
# it will schedule the experiment pod on the tainted node
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
        # tolerations for the experiment pod
        tolerations:
        - key: "key1"
          operator: "Equal"
          value: "value1"
          effect: "Schedule"
  
```

### Experiment Status Check Timeout

It overrides the status timeouts inside chaosexperiments. It contains timeout & delay in seconds. It can be tuned via `statusCheckTimeouts` field. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/experiment-components/experiment-statusCheckTimeout.yaml yaml)
```yaml
# contains status check timeout for the experiment pod
# it will set this timeout as upper bound while checking application status, node status in experiments
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
        # status check timeout for the experiment pod
        statusCheckTimeouts:
          delay: 2
          timeout: 180
  
```
