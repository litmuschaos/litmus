It specifies the name of the serviceaccount mapped to a role/clusterRole with enough permissions to execute the desired chaos experiment. The minimum permissions needed for any given experiment are provided in the `.spec.definition.permissions` field of the respective chaosexperiment CR.
It can be tuned via `chaosServiceAccount` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/engine-spec/service-account.yaml yaml)
```yaml
# contains name of the serviceAccount which contains all the RBAC permissions required for the experiment
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
  # name of the service account w/ sufficient permissions
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
  
```