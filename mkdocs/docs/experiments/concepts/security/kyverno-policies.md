[Kyverno policies](https://kyverno.io/policies/pod-security/) blocks configurations that don't match a policy (enforce mode) or can generate policy violations (audit mode). It scans existing configurations and reports violations in the cluster. 
Litmus recommends using the provided policy configuration to enable the execution of all supported (out-of-the-box) experiments listed in the chaoshub. Having said that, this is recommendatory in nature and left to user discretion/choice depending upon experiments desired.  

The details listed here are expected to aid users of Kyverno. If you are using alternate means to enforce runtime security, such as native Kubernetes PSPs (pod security policies), refer this section: [refer](https://litmuschaos.github.io/litmus/experiments/concepts/security/psp/)

## Policies in Litmus

Litmus recommends using the following policies:

1. [Add Capabilities](https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/security/kyverno-policies/allow-capabilities-for-litmus-experiments-which-uses-runtime-api.yaml): It restricts add capabilities except the `NET_ADMIN` and `SYS_ADMIN` for the pods that use runtime API
1. [Host Namespaces](https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/security/kyverno-policies/allow-host-namespaces-for-litmus-experiments-which-uses-runtime-api.yaml): It validates following host namespaces for the pods that use runtime API.
    1. HostPID: It allows hostPID. It should be set to `true`.
    1. HostIPC: It restricts the host IPC. It should be set to `false`.
    1. HostNetwork: It restricts the hostNetwork. It should be set to `false`.
1. [Host Paths](https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/security/kyverno-policies/allow-host-paths-for-litmus-experiments-which-uses-hostPaths.yaml): It restricts hostPath except the `socket-path` & `container-path` host paths for the pods that uses runtime API. It allows hostPaths for service-kill experiments.
1. [Privilege Escalation](https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/security/kyverno-policies/allow-privilege-escalation-for-litmus-experiments-which-uses-runtime-api.yaml): It restricts privilege escalation except for the pods that use runtime API
1. [Privilege Container](https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/security/kyverno-policies/allow-privileged-containers-for-litmus-experiments-which-uses-runtime-api.yaml): It restricts privileged containers except for the pods that use runtime API
1. [User Groups](https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/security/kyverno-policies/allow-user-groups-for-litmus-experiments.yaml): It allows users groups for all the experiment pods

## Install Policies

These Kyverno policies are based on the [Kubernetes Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) definitons. To apply all pod security policies (recommended) [install Kyverno](https://kyverno.io/docs/installation/) and [kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/), then run:

```bash
kustomize build https://github.com/litmuschaos/chaos-charts/security/kyverno-policies | kubectl apply -f -
```

## Pod Security Policies in restricted setup

If setup contains restricted policies which don't allow execution of litmus experiments by default. For Example [deny-privilege-escalation](https://kyverno.io/policies/pod-security/restricted/deny-privilege-escalation/deny-privilege-escalation/) policy doesn't allow privileged escalation. It deny all the pods to use privileged escalation.

To allow litmus pods to use the privileged escalation. Add the litmus serviceAcccount or ClusterRole/Role inside the exclude block as :

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/security/restricted-policies.yaml yaml)
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: deny-privilege-escalation
  annotations:
    policies.kyverno.io/category: Pod Security Standards (Restricted)
    policies.kyverno.io/severity: medium
    policies.kyverno.io/subject: Pod
    policies.kyverno.io/description: >-
      Privilege escalation, such as via set-user-ID or set-group-ID file mode, should not be allowed.
      This policy ensures the `allowPrivilegeEscalation` fields are either undefined
      or set to `false`.      
spec:
  background: true
  validationFailureAction: enforce
  rules:
  - name: deny-privilege-escalation
    match:
      resources:
        kinds:
        - Pod
    exclude:
      clusterRoles:
      # add litmus cluster roles here
      - litmus-admin
      roles:
      # add litmus roles here
      - litmus-roles
      subjects:
      # add serviceAccount name here
      - kind: ServiceAccount
        name: pod-network-loss-sa
    validate:
      message: >-
        Privilege escalation is disallowed. The fields
        spec.containers[*].securityContext.allowPrivilegeEscalation, and
        spec.initContainers[*].securityContext.allowPrivilegeEscalation must
        be undefined or set to `false`.        
      pattern:
        spec:
          =(initContainers):
          - =(securityContext):
              =(allowPrivilegeEscalation): "false"
          containers:
          - =(securityContext):
              =(allowPrivilegeEscalation): "false"
```