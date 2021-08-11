It is a user-defined flag to trigger chaos. Setting it to `active` ensures the successful execution of chaos. Patching it with `stop` aborts ongoing experiments. It has a corresponding flag in the chaosengine status field, called `engineStatus` which is updated by the controller based on the actual state of the ChaosEngine.
It can be tuned via `engineState` field. It supports `active` and `stop` values. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/chaos-resources/engine-spec/engine-state.yaml yaml)
```yaml
# contains the chaosengine state
# supports: active and stop states
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  # contains the state of engine 
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
  
```