## Introduction

- It blocks the 100% Ingress and Egress traffic of the target application by creating network policy.
- It can test the application's resilience to lossy/flaky network

!!! tip "Scenario: Induce network loss of the target pod"    
    ![Pod Network Partition](../../images/pod-network-partition.png)

## Uses

??? info "View the uses of the experiment" 
    coming soon

## Prerequisites

??? info "Verify the prerequisites" 
    - Ensure that Kubernetes Version > 1.16 
    - Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a href="https://v1-docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a>
    - Ensure that the <code>pod-network-partition</code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a href="https://hub.litmuschaos.io/api/chaos/master?file=faults/kubernetes/pod-network-partition/fault.yaml">here</a> 
    
## Default Validations

??? info "View the default validations" 
    The application pods should be in running state before and after chaos injection.

## Minimal RBAC configuration example (optional)

!!! tip "NOTE"   
    If you are using this experiment as part of a litmus workflow scheduled constructed & executed from chaos-center, then you may be making use of the [litmus-admin](https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml) RBAC, which is pre installed in the cluster as part of the agent setup.

    ??? note "View the Minimal RBAC permissions"

        ```yaml
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: pod-network-partition-sa
          namespace: default
          labels:
            name: pod-network-partition-sa
            app.kubernetes.io/part-of: litmus
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: Role
        metadata:
          name: pod-network-partition-sa
          namespace: default
          labels:
            name: pod-network-partition-sa
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
          # performs CRUD operations on the network policies
          - apiGroups: ["networking.k8s.io"]
            resources: ["networkpolicies"]
            verbs: ["create","delete","list","get"]
          # for creation, status polling and deletion of litmus chaos resources used within a chaos workflow
          - apiGroups: ["litmuschaos.io"]
            resources: ["chaosengines","chaosexperiments","chaosresults"]
            verbs: ["create","list","get","patch","update","delete"]
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: RoleBinding
        metadata:
          name: pod-network-partition-sa
          namespace: default
          labels:
            name: pod-network-partition-sa
            app.kubernetes.io/part-of: litmus
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: Role
          name: pod-network-partition-sa
        subjects:
        - kind: ServiceAccount
          name: pod-network-partition-sa
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
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The time duration for chaos insertion (seconds) </td>
        <td> Default (60s) </td>
      </tr>
      <tr>
        <td> POLICY_TYPES </td>
        <td> Contains type of network policy </td>
        <td> It supports <code>egress</code>, <code>ingress</code> and <code>all</code> values</td>
      </tr>
      <tr>
        <td> POD_SELECTOR </td>
        <td> Contains labels of the destination pods </td>
        <td> </td>
      </tr>
      <tr>
        <td> NAMESPACE_SELECTOR </td>
        <td> Contains labels of the destination namespaces </td>
        <td> </td>
      </tr>
      <tr>
        <td> PORTS </td>
        <td> Comma separated list of the targeted ports </td>
        <td> </td>
      </tr>
      <tr>
        <td> DESTINATION_IPS </td>
        <td> IP addresses of the services or pods or the CIDR blocks(range of IPs), the accessibility to which is impacted </td>
        <td> comma separated IP(S) or CIDR(S) can be provided. if not provided, it will induce network chaos for all ips/destinations</td>
      </tr>  
      <tr>
        <td> DESTINATION_HOSTS </td>
        <td> DNS Names/FQDN names of the services, the accessibility to which, is impacted </td>
        <td> if not provided, it will induce network chaos for all ips/destinations or DESTINATION_IPS if already defined</td>
      </tr>      
      <tr>
        <td> LIB </td>
        <td> The chaos lib used to inject the chaos </td>
        <td> supported value: litmus </td>
      </tr>
      <tr>
        <td> RAMP_TIME </td>
        <td> Period to wait before and after injection of chaos in sec </td>
        <td> </td>
      </tr>
    </table>

## Experiment Examples  

### Common and Pod specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [Pod specific tunable](common-tunables-for-pod-experiments.md) to tune the common tunables for all experiments and pod specific tunables. 

### Destination IPs And Destination Hosts

The network partition experiment interrupt traffic for all the IPs/hosts by default. The interruption of specific IPs/Hosts can be tuned via `DESTINATION_IPS` and `DESTINATION_HOSTS` ENV.

- `DESTINATION_IPS`: It contains the IP addresses of the services or pods or the CIDR blocks(range of IPs), the accessibility to which is impacted.
- `DESTINATION_HOSTS`: It contains the DNS Names/FQDN names of the services, the accessibility to which, is impacted.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-network-partition/destination-ips-and-hosts.yaml yaml)
```yaml
# it inject the chaos for specific ips/hosts
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
  chaosServiceAccount: pod-network-partition-sa
  experiments:
  - name: pod-network-partition
    spec:
      components:
        env:
        # supports comma separated destination ips
        - name: DESTINATION_IPS
          value: '8.8.8.8,192.168.5.6'
        # supports comma separated destination hosts
        - name: DESTINATION_HOSTS
          value: 'nginx.default.svc.cluster.local,google.com'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Target Specific Namespace(s)

The network partition experiment interrupt traffic for all the namespaces by default. The access to/from pods in specific namespace can be allowed via providing namespace labels inside `NAMESPACE_SELECTOR` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-network-partition/namespace-selectors.yaml yaml)
```yaml
# it inject the chaos for specified namespaces, matched by labels
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
  chaosServiceAccount: pod-network-partition-sa
  experiments:
  - name: pod-network-partition
    spec:
      components:
        env:
        # labels of the destination namespace
        - name: NAMESPACE_SELECTOR
          value: 'key=value'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
### Target Specific Pod(s)

The network partition experiment interrupt traffic for all the extranal pods by default. The access to/from specific pod(s) can be allowed via providing pod labels inside `POD_SELECTOR` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-network-partition/pod-selectors.yaml yaml)
```yaml
# it inject the chaos for specified pods, matched by labels
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
  chaosServiceAccount: pod-network-partition-sa
  experiments:
  - name: pod-network-partition
    spec:
      components:
        env:
        # labels of the destination pods
        - name: POD_SELECTOR
          value: 'key=value'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Policy Type

The network partition experiment interrupt both ingress and egress traffic by default. The interruption of either `ingress` or `egress` traffic can be tuned via `POLICY_TYPES` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-network-partition/policy-type.yaml yaml)
```yaml
# inject network loss for only ingress or only engress or all traffics
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
  chaosServiceAccount: pod-network-partition-sa
  experiments:
  - name: pod-network-partition
    spec:
      components:
        env:
        # provide the network policy type
        # it supports `ingress`, `egress`, and `all` values
        # default value is `all`
        - name: POLICY_TYPES
          value: 'all'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Destination Ports

The network partition experiment interrupt traffic for all the external ports by default. Access to specific port(s) can be allowed by providing comma separated list of ports inside `PORTS` ENV. 

Note: 

- If `PORT` is not set and none of the pod-selector, namespace-selector and destination_ips are provided then it will block traffic for all ports for all pods/ips
- If `PORT` is not set but any of the podselector, nsselector and destination ips are provided then it will allow all ports for all the pods/ips filtered by the specified selectors

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/pods/pod-network-partition/ports.yaml yaml)
```yaml
# it inject the chaos for specified ports
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
  chaosServiceAccount: pod-network-partition-sa
  experiments:
  - name: pod-network-partition
    spec:
      components:
        env:
        # comma separated list of ports
        - name: PORTS
          value: 'tcp: [8080,80], udp: [9000,90]'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
