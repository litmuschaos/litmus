## Introduction

- This experiment causes disk stress on the application pod. The experiment aims to verify the resiliency of applications that share this disk resource for ephemeral or persistent storage purposes

!!! tip "Scenario: Stress the IO of the target pod"    
    ![Pod IO Stress](../../images/pod-stress.png)

## Uses

??? info "View the uses of the experiment" 
    Disk Pressure or CPU hogs is another very common and frequent scenario we find in kubernetes applications that can result in the eviction of the application replica and impact its delivery. Such scenarios that can still occur despite whatever availability aids K8s provides. These problems are generally referred to as "Noisy Neighbour" problems

    Stressing the disk with continuous and heavy IO for example can cause degradation in reads written by other microservices that use this shared disk for example modern storage solutions for Kubernetes use the concept of storage pools out of which virtual volumes/devices are carved out. Another issue is the amount of scratch space eaten up on a node which leads to  the lack of space for newer containers to get scheduled (kubernetes too gives up by applying an "eviction" taint like "disk-pressure") and causes a wholesale movement of all pods to other nodes

## Prerequisites

??? info "Verify the prerequisites" 
    - Ensure that Kubernetes Version > 1.16 
    - Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a href="https://v1-docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a>
    - Ensure that the <code>pod-io-stress</code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a href="https://hub.litmuschaos.io/api/chaos/master?file=faults/kubernetes/pod-io-stress/fault.yaml">here</a> 
    
## Default Validations

??? info "View the default validations" 
    The application pods should be in running state before and after chaos injection.

## Minimal RBAC configuration example (optional)

!!! tip "NOTE"   
    If you are using this experiment as part of a litmus workflow scheduled constructed & executed from chaos-center, then you may be making use of the [litmus-admin](https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml) RBAC, which is pre installed in the cluster as part of the agent setup..

    ??? note "View the Minimal RBAC permissions"

        ```yaml
        ---
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: pod-io-stress-sa
          namespace: default
          labels:
            name: pod-io-stress-sa
            app.kubernetes.io/part-of: litmus
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: Role
        metadata:
          name: pod-io-stress-sa
          namespace: default
          labels:
            name: pod-io-stress-sa
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
          # deriving the parent/owner details of the pod(if parent is anyof {deployment, statefulset, daemonsets})
          - apiGroups: ["apps"]
            resources: ["deployments","statefulsets","replicasets", "daemonsets"]
            verbs: ["list","get"]
          # deriving the parent/owner details of the pod(if parent is deploymentConfig)  
          - apiGroups: ["apps.openshift.io"]
            resources: ["deploymentconfigs"]
            verbs: ["list","get"]
          # deriving the parent/owner details of the pod(if parent is deploymentConfig)
          - apiGroups: [""]
            resources: ["replicationcontrollers"]
            verbs: ["get","list"]
          # deriving the parent/owner details of the pod(if parent is argo-rollouts)
          - apiGroups: ["argoproj.io"]
            resources: ["rollouts"]
            verbs: ["list","get"]
          # for configuring and monitor the experiment job by the chaos-runner pod
          - apiGroups: ["batch"]
            resources: ["jobs"]
            verbs: ["create","list","get","delete","deletecollection"]
          # for creation, status polling and deletion of litmus chaos resources used within a chaos workflow
          - apiGroups: ["litmuschaos.io"]
            resources: ["chaosengines","chaosexperiments","chaosresults"]
            verbs: ["create","list","get","patch","update","delete"]
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: RoleBinding
        metadata:
          name: pod-io-stress-sa
          namespace: default
          labels:
            name: pod-io-stress-sa
            app.kubernetes.io/part-of: litmus
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: Role
          name: pod-io-stress-sa
        subjects:
        - kind: ServiceAccount
          name: pod-io-stress-sa
          namespace: default
        ```
        Use this sample RBAC manifest to create a chaosServiceAccount in the desired (app) namespace. This example consists of the minimum necessary role permissions to execute the experiment.

## Experiment tunables

??? info "check the experiment tunables"
    <h2>Optional Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
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
        <td> NUMBER_OF_WORKERS </td>
        <td> It is the number of IO workers involved in IO disk stress </td>
        <td> Default to 4 </td>
      </tr> 
      <tr>
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The time duration for chaos (seconds)  </td>
        <td> Default to 120s </td>
      </tr>
      <tr>
        <td> VOLUME_MOUNT_PATH </td>
        <td> Fill the given volume mount path</td>
        <td>  </td>
      </tr>  
      <tr>
        <td> LIB  </td>
        <td> The chaos lib used to inject the chaos </td>
        <td> Default to </code>litmus<code>. Available litmus and pumba. </td>
      </tr>
      <tr>
        <td> LIB_IMAGE  </td>
        <td> Image used to run the stress command </td>
        <td> Default to <code>litmuschaos/go-runner:latest<code> </td>
      </tr>  
      <tr>
        <td> TARGET_PODS </td>
        <td> Comma separated list of application pod name subjected to pod io stress chaos</td>
        <td> If not provided, it will select target pods randomly based on provided appLabels</td>
      </tr>  
      <tr>
        <td> PODS_AFFECTED_PERC </td>
        <td> The Percentage of total pods to target  </td>
        <td> Defaults to 0 (corresponds to 1 replica), provide numeric value only </td>
      </tr>
      <tr>
        <td> CONTAINER_RUNTIME  </td>
        <td> container runtime interface for the cluster</td>
        <td> Defaults to containerd, supported values: docker, containerd and crio for litmus and only docker for pumba LIB </td>
      </tr>
      <tr>
        <td> SOCKET_PATH </td>
        <td> Path of the containerd/crio/docker socket file </td>
        <td> Defaults to </code>/run/containerd/containerd.sock</code> </td>
      </tr>    
      <tr>
        <td> RAMP_TIME </td>
        <td> Period to wait before and after injection of chaos in sec </td>
        <td> </td>
      </tr>
      <tr>
        <td> SEQUENCE </td>
        <td> It defines sequence of chaos execution for multiple target pods </td>
        <td> Default value: parallel. Supported: serial, parallel </td>
      </tr>
    </table>

## Experiment Examples

### Common and Pod specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Pod specific tunable](common-tunables-for-pod-experiments.md) to tune the common tunables for all experiments and pod specific tunables. 

### Filesystem Utilization Percentage

It stresses the `FILESYSTEM_UTILIZATION_PERCENTAGE` percentage of total free space available in the pod. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-io-stress/filesystem-utilization-percentage.yaml yaml)
```yaml
# stress the i/o of the targeted pod with FILESYSTEM_UTILIZATION_PERCENTAGE of total free space 
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_BYTES.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # percentage of free space of file system, need to be stressed
        - name: FILESYSTEM_UTILIZATION_PERCENTAGE
          value: '10' #in GB
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Filesystem Utilization Bytes

It stresses the `FILESYSTEM_UTILIZATION_BYTES` GB of the i/o of the targeted pod. 
It is mutually exclusive with the `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV. If `FILESYSTEM_UTILIZATION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `FILESYSTEM_UTILIZATION_BYTES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-io-stress/filesystem-utilization-bytes.yaml yaml)
```yaml
# stress the i/o of the targeted pod with given FILESYSTEM_UTILIZATION_BYTES
# it is mutually exclusive with the FILESYSTEM_UTILIZATION_PERCENTAGE.
# if both are provided then it will use FILESYSTEM_UTILIZATION_PERCENTAGE for stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # size of io to be stressed
        - name: FILESYSTEM_UTILIZATION_BYTES
          value: '1' #in GB
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.

- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
- `SOCKET_PATH`: It contains path of docker socket file by default(`/run/containerd/containerd.sock`). For other runtimes provide the appropriate path.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-io-stress/container-runtime-and-socket-path.yaml yaml)
```yaml
## provide the container runtime and socket file path
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # runtime for the container
        # supports docker, containerd, crio
        - name: CONTAINER_RUNTIME
          value: 'containerd'
        # path of the socket file
        - name: SOCKET_PATH
          value: '/run/containerd/containerd.sock'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Mount Path

The volume mount path, which needs to be filled. It can be tuned with `VOLUME_MOUNT_PATH` ENV. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-io-stress/mount-path.yaml yaml)
```yaml
# provide the volume mount path, which needs to be filled
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # path need to be stressed/filled
        - name: VOLUME_MOUNT_PATH
          value: '/some-dir-in-container'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Workers For Stress

The worker's count for the stress can be tuned with `NUMBER_OF_WORKERS` ENV. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-io-stress/workers.yaml yaml)
```yaml
# number of workers for the stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # number of io workers 
        - name: NUMBER_OF_WORKERS
          value: '4'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-io-stress/pumba.yaml yaml)
```yaml
# use the pumba lib for io stress
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
  chaosServiceAccount: pod-io-stress-sa
  experiments:
  - name: pod-io-stress
    spec:
      components:
        env:
        # name of lib
        # it supports litmus and pumba lib
        - name: LIB
          value: 'pumba'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
