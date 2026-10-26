## Introduction

- This experiment consumes the Memory resources on the application container on specified memory in megabytes.

- It simulates conditions where app pods experience Memory spikes either due to expected/undesired processes thereby testing how the overall application stack behaves when this occurs.

!!! tip "Scenario: Stress the Memory"    
    ![Pod Memory Hog Exec](../../images/pod-stress.png)

## Uses

??? info "View the uses of the experiment" 
    Memory usage within containers is subject to various constraints in Kubernetes. If the limits are specified in their spec, exceeding them can cause termination of the container (due to OOMKill of the primary process, often pid 1) - the restart of the container by kubelet, subject to the policy specified. For containers with no limits placed, the memory usage is uninhibited until such time as the Node level OOM Behaviour takes over. In this case, containers on the node can be killed based on their oom_score and the QoS class a given pod belongs to (bestEffort ones are first to be targeted). This eval is extended to all pods running on the node - thereby causing a bigger blast radius. 

    This experiment launches a stress process within the target container - which can cause either the primary process in the container to be resource constrained in cases where the limits are enforced OR eat up available system memory on the node in cases where the limits are not specified
    
## Prerequisites

??? info "Verify the prerequisites" 
    - Ensure that Kubernetes Version > 1.16 
    - Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a href="https://v1-docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a>
    - Ensure that the <code>pod-memory-hog-exec</code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a href="https://hub.litmuschaos.io/api/chaos/master?file=faults/kubernetes/pod-cpu-memory-exec/fault.yaml">here</a> 
    
## Default Validations

??? info "View the default validations" 
    The application pods should be in running state before and after chaos injection.

## Minimal RBAC configuration example (optional)

!!! tip "NOTE"   
    If you are using this experiment as part of a litmus workflow scheduled constructed & executed from chaos-center, then you may be making use of the [litmus-admin](https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml) RBAC, which is pre installed in the cluster as part of the agent setup.

    ??? note "View the Minimal RBAC permissions"

        ```yaml
        ---
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: pod-memory-hog-exec-sa
          namespace: default
          labels:
            name: pod-memory-hog-exec-sa
            app.kubernetes.io/part-of: litmus
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: Role
        metadata:
          name: pod-memory-hog-exec-sa
          namespace: default
          labels:
            name: pod-memory-hog-exec-sa
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
          name: pod-memory-hog-exec-sa
          namespace: default
          labels:
            name: pod-memory-hog-exec-sa
            app.kubernetes.io/part-of: litmus
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: Role
          name: pod-memory-hog-exec-sa
        subjects:
        - kind: ServiceAccount
          name: pod-memory-hog-exec-sa
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
        <td> MEMORY_CONSUMPTION </td>
        <td>  The amount of memory used of hogging a Kubernetes pod (megabytes)</td>
        <td> Defaults to 500MB (Up to 2000MB)</td>
      </tr>
      <tr>
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The time duration for chaos insertion (seconds)  </td>
        <td> Defaults to 60s </td>
      </tr>
        <td> LIB  </td>
        <td> The chaos lib used to inject the chaos. Available libs are <code>litmus</code></td>
        <td> Defaults to <code>litmus</code> </td>
      </tr>
      <tr>
        <td> TARGET_PODS </td>
        <td> Comma separated list of application pod name subjected to pod memory hog chaos</td>
        <td> If not provided, it will select target pods randomly based on provided appLabels</td>
      </tr>
      <tr> 
        <td> TARGET_CONTAINER </td>
        <td> Name of the target container under chaos </td>
        <td> If not provided, it will select the first container of the target pod </td>
      </tr> 
      <tr>
        <td> CHAOS_KILL_COMMAND </td>
        <td> The command to kill the chaos process </td>
        <td> Defaults to <code>kill $(find /proc -name exe -lname '*/dd' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}' | head -n 1)</code>. Another useful one that generally works (in case the default doesn't) is <code>kill -9 $(ps afx | grep "[dd] if=/dev/zero" | awk '{print $1}' | tr '\n' ' ')</code>. In case neither works, please check whether the target pod's base image offers a shell. If yes, identify appropriate shell command to kill the chaos process </td>
      </tr>
      <tr>
        <td> PODS_AFFECTED_PERC </td>
        <td> The Percentage of total pods to target  </td>
        <td> Defaults to 0 (corresponds to 1 replica), provide numeric value only </td>
      </tr>
      <tr>
        <td> RAMP_TIME </td>
        <td> Period to wait before injection of chaos in sec </td>
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

### Memory Consumption

It stresses the `MEMORY_CONSUMPTION` MB memory of the targeted pod for the `TOTAL_CHAOS_DURATION` duration.
The memory consumption limit is 2000MB

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-memory-hog-exec/memory-consumption.yaml yaml)
```yaml
# memory to be stressed in MB
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
  chaosServiceAccount: pod-memory-hog-sa
  experiments:
  - name: pod-memory-hog
    spec:
      components:
        env:
        # memory consuption value in MB
        # it is limited to 2000MB
        - name: MEMORY_CONSUMPTION
          value: '500' #in MB
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Chaos Kill Commands

It defines the `CHAOS_KILL_COMMAND` ENV to set the chaos kill command.
Default values of `CHAOS_KILL_COMMAND` command:

- `CHAOS_KILL_COMMAND`: "kill $(find /proc -name exe -lname '*/dd' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}' | head -n 1)"

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-memory-hog-exec/kill-command.yaml yaml)
```yaml
# provide the chaos kill command used to kill the chaos process
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
  chaosServiceAccount: pod-memory-hog-exec-sa
  experiments:
  - name: pod-memory-hog-exec
    spec:
      components:
        env:
        # command to kill the dd process
        # alternative command: "kill -9 $(ps afx | grep "[dd] if=/dev/zero" | awk '{print $1}' | tr '\n' ' ')"
        - name: CHAOS_KILL_COMMAND
          value: "kill $(find /proc -name exe -lname '*/dd' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}' | head -n 1)"
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
