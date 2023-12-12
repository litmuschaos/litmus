## Introduction

- This experiment causes io stress on the Kubernetes node. The experiment aims to verify the resiliency of applications that share this disk resource for ephemeral or persistent storage purposes.
- The amount of io stress can be either specifed as the size in percentage of the total free space on the file system or simply in Gigabytes(GB). When provided both it will execute with the utilization percentage specified and non of them are provided it will execute with default value of 10%.
- It tests application resiliency upon replica evictions caused due IO stress on the available Disk space.

!!! tip "Scenario: Stress the IO of Node"    
    ![Node IO Stress](../../images/node-stress.png)

## Uses

??? info "View the uses of the experiment" 
    coming soon

## Prerequisites

??? info "Verify the prerequisites" 
    - Ensure that Kubernetes Version > 1.16 
    - Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a href="https://v1-docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a>
    - Ensure that the <code>node-io-stress</code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a href="https://hub.litmuschaos.io/api/chaos/master?file=faults/kubernetes/node-io-stress/fault.yaml">here</a> 
    
## Default Validations

??? info "View the default validations" 
    The target nodes should be in ready state before and after chaos injection.

## Minimal RBAC configuration example (optional)

!!! tip "NOTE"   
    If you are using this experiment as part of a litmus workflow scheduled constructed & executed from chaos-center, then you may be making use of the [litmus-admin](https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml) RBAC, which is pre installed in the cluster as part of the agent setup.

    ??? note "View the Minimal RBAC permissions"

        ```yaml
        ---
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: node-io-stress-sa
          namespace: default
          labels:
            name: node-io-stress-sa
            app.kubernetes.io/part-of: litmus
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRole
        metadata:
          name: node-io-stress-sa
          labels:
            name: node-io-stress-sa
            app.kubernetes.io/part-of: litmus
        rules:
          # Create and monitor the experiment & helper pods
          - apiGroups: [""]
            resources: ["pods"]
            verbs: ["create","delete","get","list","patch","update", "deletecollection"]
          # Performs CRUD operations on the events inside chaosengine and chaosresult
          - apiGroups: [""]
            resources: ["events"]
            verbs: ["create","get","list","patch","update"]
          # Fetch configmaps details and mount it to the experiment pod (if specified)
          - apiGroups: [""]
            resources: ["configmaps"]
            verbs: ["get","list",]
          # Track and get the runner, experiment, and helper pods log 
          - apiGroups: [""]
            resources: ["pods/log"]
            verbs: ["get","list","watch"]  
          # for creating and managing to execute comands inside target container
          - apiGroups: [""]
            resources: ["pods/exec"]
            verbs: ["get","list","create"]
          # for configuring and monitor the experiment job by the chaos-runner pod
          - apiGroups: ["batch"]
            resources: ["jobs"]
            verbs: ["create","list","get","delete","deletecollection"]
          # for creation, status polling and deletion of litmus chaos resources used within a chaos workflow
          - apiGroups: ["litmuschaos.io"]
            resources: ["chaosengines","chaosexperiments","chaosresults"]
            verbs: ["create","list","get","patch","update","delete"]
          # for experiment to perform node status checks
          - apiGroups: [""]
            resources: ["nodes"]
            verbs: ["get","list"]
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRoleBinding
        metadata:
          name: node-io-stress-sa
          labels:
            name: node-io-stress-sa
            app.kubernetes.io/part-of: litmus
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: ClusterRole
          name: node-io-stress-sa
        subjects:
        - kind: ServiceAccount
          name: node-io-stress-sa
          namespace: default
        ```

        Use this sample RBAC manifest to create a chaosServiceAccount in the desired (app) namespace. This example consists of the minimum necessary role permissions to execute the experiment.

## Experiment tunables

??? info "check the experiment tunables"
    <h2>Mandatory Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr>
        <td> TARGET_NODES </td>
        <td> Comma separated list of nodes, subjected to node io stress chaos</td>
        <td> </td>
      </tr>
      <tr>
        <td> NODE_LABEL </td>
        <td> It contains node label, which will be used to filter the target nodes if TARGET_NODES ENV is not set </td>
        <td>It is mutually exclusive with the TARGET_NODES ENV. If both are provided then it will use the TARGET_NODES</td>
      </tr>
    </table>

    <h2>Optional Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr>
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The time duration for chaos (seconds) </td>
        <td> Default to 120 </td>
      </tr>
      <tr>
        <td> FILESYSTEM_UTILIZATION_PERCENTAGE </td>
        <td> Specify the size as percentage of free space on the file system  </td>
        <td> Default to 10%</td>
      </tr>
      <tr>
        <td> FILESYSTEM_UTILIZATION_BYTES </td>
        <td> Specify the size in GigaBytes(GB).  <code>FILESYSTEM_UTILIZATION_PERCENTAGE</code> & <code>FILESYSTEM_UTILIZATION_BYTES</code> are mutually exclusive. If both are provided, <code>FILESYSTEM_UTILIZATION_PERCENTAGE</code> is prioritized. </td>
        <td>  </td>
      </tr>
      <tr>
        <td> CPU </td>
        <td> Number of core of CPU to be used </td>
        <td> Default to 1 </td>
      </tr>    
      <tr>
        <td> NUMBER_OF_WORKERS </td>
        <td> It is the number of IO workers involved in IO disk stress </td>
        <td> Default to 4 </td>
      </tr> 
      <tr>
        <td> VM_WORKERS </td>
        <td> It is the number vm workers involved in IO disk stress </td>
        <td> Default to 1 </td>
      </tr>     
      <tr>
        <td> LIB  </td>
        <td> The chaos lib used to inject the chaos </td>
        <td> Default to <code>litmus</code> </td>
      </tr>
      <tr>
        <td> LIB_IMAGE  </td>
        <td> Image used to run the stress command </td>
        <td> Default to <code>litmuschaos/go-runner:latest<code> </td>
      </tr>
      <tr>
        <td> RAMP_TIME </td>
        <td> Period to wait before and after injection of chaos in sec </td>
        <td> </td>
      </tr>
      <tr>
        <td> NODES_AFFECTED_PERC </td>
        <td> The Percentage of total nodes to target  </td>
        <td> Defaults to 0 (corresponds to 1 node), provide numeric value only </td>
      </tr> 
      <tr>
        <td> SEQUENCE </td>
        <td> It defines sequence of chaos execution for multiple target pods </td>
        <td> Default value: parallel. Supported: serial, parallel </td>
      </tr>
    </table>

## Experiment Examples

### Common and Node specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Node specific tunable](common-tunables-for-node-experiments.md) to tune the common tunables for all experiments and node specific tunables.  

### Filesystem Utilization Percentage

It stresses the `FILESYSTEM_UTILIZATION_PERCENTAGE` percentage of total free space available in the node. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/nodes/node-io-stress/filesystem-utilization-percentage.yaml yaml)
```yaml
# stress the i/o of the targeted node with FILESYSTEM_UTILIZATION_PERCENTAGE of total free space 
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_BYTES.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # percentage of total free space of file system
        - name: FILESYSTEM_UTILIZATION_PERCENTAGE
          value: '10' # in percentage
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Filesystem Utilization Bytes

It stresses the `FILESYSTEM_UTILIZATION_BYTES` GB of the i/o of the targeted node. 
It is mutually exclusive with the `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV. If `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `FILESYSTEM_UTILIZATION_BYTES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/nodes/node-io-stress/filesystem-utilization-bytes.yaml yaml)
```yaml
# stress the i/o of the targeted node with given FILESYSTEM_UTILIZATION_BYTES
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_PERCENTAGE.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # file system to be stress in GB
        - name: FILESYSTEM_UTILIZATION_BYTES
          value: '500' # in GB
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Limit CPU Utilization

The CPU usage can be limit to `CPU` cpu while performing io stress. It can be tuned via `CPU` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/nodes/node-io-stress/limit-cpu-utilization.yaml yaml)
```yaml
# limit the cpu uses to the provided value while performing io stress
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # number of cpu cores to be stressed
        - name: CPU
          value: '1' 
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Workers For Stress

The i/o and VM workers count for the stress can be tuned with `NUMBER_OF_WORKERS` and `VM_WORKERS` ENV respectively. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/nodes/node-io-stress/workers.yaml yaml)
```yaml
# define the workers count for the i/o and vm
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: node-io-stress-sa
  experiments:
  - name: node-io-stress
    spec:
      components:
        env:
        # total number of io workers involved in stress
        - name: NUMBER_OF_WORKERS
          value: '4' 
          # total number of vm workers involved in stress
        - name: VM_WORKERS
          value: '1'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
