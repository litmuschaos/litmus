## Kubernetes Probes

With the proliferation of custom resources & operators, especially in the case of stateful applications, the steady-state is manifested as status parameters/flags within Kubernetes resources. `k8sProbe` addresses verification of the desired resource state by allowing users to define the Kubernetes GVR (group-version-resource) with appropriate filters (field selectors/label selectors). The experiment makes use of the Kubernetes Dynamic Client to achieve this. It supports CRUD operations which can be defined at `probe.k8sProbe/inputs.operation`.
It can be executed by setting `type` as `k8sProbe` inside `.spec.experiments[].spec.probe`.

### Create Operation

It creates kubernetes resource based on the data provided inside `probe.data` field. It can be defined by setting `operation` to `create` operation.

Use the following example to tune this:
<references to the sample manifest> 

### Delete Operation

It deletes matching kubernetes resources via GVR and filters (field selectors/label selectors) provided at `probe.k8sProbe/inputs`. It can be defined by setting `operation` to `delete` operation.

Use the following example to tune this:
<references to the sample manifest> 

### Present Operation

It checks for the presence of kubernetes resource based on GVR and filters (field selectors/labelselectors) provided at `probe.k8sProbe/inputs`. It can be defined by setting `operation` to `present` operation.

Use the following example to tune this:
<references to the sample manifest> 

### Absent Operation

It checks for the absence of kubernetes resource based on GVR and filters (field selectors/labelselectors)  provided at `probe.k8sProbe/inputs`. It can be defined by setting `operation` to `absent` operation.

Use the following example to tune this:
<references to the sample manifest> 
