It defines the `appns`, `applabel`, and `appkind` to set the namespace, labels, and kind of the application under test.
- `appkind`: It supports `deployment`, `statefulset`, `daemonset`, `deploymentconfig`, and `rollout`. 
It is mandatory for the pod-level experiments and optional for the rest of the experiments.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/engine-spec/app-info.yaml yaml)
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
- `auxiliaryAppInfo`: `<key1>=<value1>:<namespace1>,<key2>=<value2>:<namespace2>` 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/engine-spec/auxiliary-appinfo.yaml yaml)
```yaml
# contains the comma seperated list of auxiliary applications details
# it is provide in `<key1>=<value1>:<namespace1>,<key2>=<value2>:<namespace2>` format
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  # provide the comma separated auxiliary applications details
  auxiliaryAppInfo: "app=nginx:nginx,app=busybox:default"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
  
```