## Installation steps for Litmus 3.0.0-beta9

### Mongo installation via Helm - Bitnami Mongo

```shell
helm repo add bitnami https://charts.bitnami.com/bitnami
```

#### Mongo Values

```shell
auth:
  enabled: true
  rootPassword: "1234"
  # -- existingSecret Existing secret with MongoDB(&reg;) credentials (keys: `mongodb-passwords`, `mongodb-root-password`, `mongodb-metrics-password`, ` mongodb-replica-set-key`)
  existingSecret: ""
architecture: replicaset
replicaCount: 3
persistence:
  enabled: true
volumePermissions:
  enabled: true
metrics:
  enabled: false
  prometheusRule:
    enabled: false
    
# bitnami/mongodb is not yet supported on ARM.
# Using unofficial tools to build bitnami/mongodb (arm64 support)
# more info: https://github.com/ZCube/bitnami-compat
#image:
#  registry: ghcr.io/zcube
#  repository: bitnami-compat/mongodb
#  tag: 6.0.5
```

```shell
helm install my-release bitnami/mongodb --values mongo-values.yml -n <NAMESPACE> --create-namespace
```

### Apply the Manifest

Applying the manifest file will install all the required service account configuration and ChaosCenter.

```shell
kubectl apply -f https://litmuschaos.github.io/litmus/3.0.0-beta10/litmus-3.0.0-beta10.yaml
```
