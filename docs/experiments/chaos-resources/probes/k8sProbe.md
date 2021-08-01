## Kubernetes Probes

With the proliferation of custom resources & operators, especially in the case of stateful applications, the steady-state is manifested as status parameters/flags within Kubernetes resources. `k8sProbe` addresses verification of the desired resource state by allowing users to define the Kubernetes GVR (group-version-resource) with appropriate filters (field selectors/label selectors). The experiment makes use of the Kubernetes Dynamic Client to achieve this. It supports CRUD operations which can be defined at `probe.k8sProbe/inputs.operation`.
It can be executed by setting `type` as `k8sProbe` inside `.spec.experiments[].spec.probe`.

### Common Probe Tunables

Refer the [common attributes](common.md) to tune the common tunables for all the probes.

### Create Operation

It creates kubernetes resource based on the data provided inside `probe.data` field. It can be defined by setting `operation` to `create` operation.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/k8sProbe/create-operation.yaml yaml)
```yaml
# create the given resource provided inside data field
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      probe:
      - name: "create-percona-pvc"
        type: "k8sProbe"
        k8sProbe/inputs:
          # group of the resource
          group: ""
          # version of the resource
          version: "v1"
          # name of the resource
          resource: "persistentvolumeclaims"
          # namespace where the instance of resource should be created
          namespace: "default"
          # type of operation
          # supports: create, delete, present, absent
          operation: "create"
        mode: "SOT"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
        # contains manifest, which can be used to create the resource
        data: |
          kind: PersistentVolumeClaim
          apiVersion: v1
          metadata:
            name: percona-mysql-claim
            labels:
              openebs.io/target-affinity: percona
          spec:
            storageClassName: standard
            accessModes:
            - ReadWriteOnce
            resources:
              requests:
                storage: 100Mi
         
```

### Delete Operation

It deletes matching kubernetes resources via GVR and filters (field selectors/label selectors) provided at `probe.k8sProbe/inputs`. It can be defined by setting `operation` to `delete` operation.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/k8sProbe/delete-operation.yaml yaml)
```yaml
# delete the resource matched with the given inputs
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      probe:
      - name: "delete-percona-pvc"
        type: "k8sProbe"
        k8sProbe/inputs:
          # group of the resource
          group: ""
          # version of the resource
          version: "v1"
          # name of the resource
          resource: "persistentvolumeclaims"
          # namespace of the instance, which needs to be deleted
          namespace: "default"
          # labels selectors for the k8s resource, which needs to be deleted
          labelSelector: "openebs.io/target-affinity=percona"
          # fieldselector for the k8s resource, which needs to be deleted
          fieldSelector: ""
          # type of operation
          # supports: create, delete, present, absent
          operation: "delete"
        mode: "EOT"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
         
```

### Present Operation

It checks for the presence of kubernetes resource based on GVR and filters (field selectors/labelselectors) provided at `probe.k8sProbe/inputs`. It can be defined by setting `operation` to `present` operation.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/k8sProbe/present-operation.yaml yaml)
```yaml
# verify the existance of the resource matched with the given inputs inside cluster
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      probe:
      - name: "check-percona-pvc-presence"
        type: "k8sProbe"
        k8sProbe/inputs:
          # group of the resource
          group: ""
          # version of the resource
          version: "v1"
          # name of the resource
          resource: "persistentvolumeclaims"
          # namespace where the instance of resource
          namespace: "default"
          # labels selectors for the k8s resource
          labelSelector: "openebs.io/target-affinity=percona"
          # fieldselector for the k8s resource
          fieldSelector: ""
          # type of operation
          # supports: create, delete, present, absent
          operation: "present"
        mode: "SOT"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
         
```

### Absent Operation

It checks for the absence of kubernetes resource based on GVR and filters (field selectors/labelselectors)  provided at `probe.k8sProbe/inputs`. It can be defined by setting `operation` to `absent` operation.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/k8sProbe/absent-operation.yaml yaml)
```yaml
# verify that the no resource should be present in cluster with the given inputs
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      probe:
      - name: "check-percona-pvc-absence"
        type: "k8sProbe"
        k8sProbe/inputs:
          # group of the resource
          group: ""
          # version of the resource
          version: "v1"
          # name of the resource
          resource: "persistentvolumeclaims"
          # namespace where the instance of resource
          namespace: "default"
          # labels selectors for the k8s resource
          labelSelector: "openebs.io/target-affinity=percona"
          # fieldselector for the k8s resource
          fieldSelector: ""
          # type of operation
          # supports: create, delete, present, absent
          operation: "absent"
        mode: "EOT"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
         
```
