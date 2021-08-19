With the proliferation of custom resources & operators, especially in the case of stateful applications, the steady-state is manifested as status parameters/flags within Kubernetes resources. `k8sProbe` addresses verification of the desired resource state by allowing users to define the Kubernetes GVR (group-version-resource) with appropriate filters (field selectors/label selectors). The experiment makes use of the Kubernetes Dynamic Client to achieve this. It supports CRUD operations which can be defined at `probe.k8sProbe/inputs.operation`.
It can be executed by setting `type` as `k8sProbe` inside `.spec.experiments[].spec.probe`.

??? info "View the k8s probe schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.name</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the name of the probe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a  (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.name</code> holds the name of the probe. It can be set based on the usecase</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.type</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the type of the probe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>httpProbe</code>, <code>k8sProbe</code>, <code>cmdProbe</code>, <code>promProbe</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.type</code> supports four type of probes. It can one of the <code>httpProbe</code>, <code>k8sProbe</code>, <code>cmdProbe</code>, <code>promProbe</code></td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.mode</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the mode of the probe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>SOT</code>, <code>EOT</code>, <code>Edge</code>, <code>Continuous</code>, <code>OnChaos</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.mode</code> supports five modes of probes. It can one of the <code>SOT</code>, <code>EOT</code>, <code>Edge</code>, <code>Continuous</code>, <code>OnChaos</code></td>
    </tr>
    </table>
    
    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.group</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the group of the kubernetes resource for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.group</code> contains group of the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.version</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the apiVersion of the kubernetes resource for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.version</code> contains apiVersion of the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.resource</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the kubernetes resource name for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.resource</code> contains the kubernetes resource name on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.namespace</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the namespace of the kubernetes resource for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.namespace</code> contains namespace of the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.fieldSelector</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the fieldSelectors of the kubernetes resource for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.fieldSelector</code> contains fieldSelector to derived the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.labelSelector</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the labelSelectors of the kubernetes resource for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.labelSelector</code> contains labelSelector to derived the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.operation</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the operation type for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>create</code>, <code>delete</code>, <code>present</code>, <code>absent</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.operation</code> contains operation which should be applied on the kubernetes resource as part of k8sProbe. It supports four type of operation. It can be one of <code>create</code>, <code>delete</code>, <code>present</code>, <code>absent</code>.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.probeTimeout</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the timeout for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.probeTimeout</code> represents the time limit for the probe to execute the specified check and return the expected data</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.retry</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the retry count for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.retry</code> contains the number of times a check is re-run upon failure in the first attempt before declaring the probe status as failed.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.interval</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the interval for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.interval</code> contains the interval for which probes waits between subsequent retries</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.probePollingInterval</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the polling interval for the probes(applicable for <code>Continuous</code> mode only)</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.probePollingInterval</code> contains the time interval for which continuous probe should be sleep after each iteration</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.initialDelaySeconds</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the initial delay interval for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.initialDelaySeconds</code> represents the initial waiting time interval for the probes.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.stopOnFailure</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td> Flags to hold the stop or continue the experiment on probe failure</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>false {type: boolean}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.stopOnFailure</code> can be set to true/false to stop or continue the experiment execution after probe fails</td>
    </tr>
    </table>

### Common Probe Tunables

Refer the [common attributes](litmus-probes.md) to tune the common tunables for all the probes.

### Create Operation

It creates kubernetes resource based on the data provided inside `probe.data` field. It can be defined by setting `operation` to `create` operation.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/k8sProbe/create-operation.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/k8sProbe/delete-operation.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/k8sProbe/present-operation.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/k8sProbe/absent-operation.yaml yaml)
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
