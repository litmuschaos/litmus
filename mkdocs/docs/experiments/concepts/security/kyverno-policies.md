[Kyverno policies](https://kyverno.io/policies/pod-security/) blocks configurations that donot match a policy(enforce mode), or can generate policy violations (audit mode). It scans existing configurations and reports violations in the cluster. 
Litmus uses kyverno policies to restrict the pod configurations and allows only defined configurations.

## Policies in Litmus

Litmus uses following pod security policies:

1. [Add Capabilities](https://github.com/ispeakc0de/chaos-charts/blob/kyverno-policies/security/kyverno-policies/allow-capabilities.yaml): It restricts add capabilities except the `NET_ADMIN` and `SYS_ADMIN` for the pods that use runtime API
1. [Host Namespaces](https://github.com/ispeakc0de/chaos-charts/blob/kyverno-policies/security/kyverno-policies/allow-host-namespaces.yaml): It validates following host namespaces for the pods that use runtime API.
    1. HostPID: It allows hostPID. It should be set to `true`.
    1. HostIPC: It restricts the host IPC. It should be set to `false`.
    1. HostNetwork: It restricts the hostNetwork. It should be set to `false`.
1. [Host Paths](https://github.com/ispeakc0de/chaos-charts/blob/kyverno-policies/security/kyverno-policies/allow-host-paths.yaml): It restricts hostPath except the `socket-path` & `container-path` host paths for the pods that uses runtime API. It allows hostPaths for service-kill experiments.
1. [Privilege Escalation](https://github.com/ispeakc0de/chaos-charts/blob/kyverno-policies/security/kyverno-policies/allow-privilege-escalation.yaml): It restricts privilege escalation except for the pods that use runtime API
1. [Privilege Container](https://github.com/ispeakc0de/chaos-charts/blob/kyverno-policies/security/kyverno-policies/allow-privileged-containers.yaml): It restricts privileged containers except for the pods that use runtime API
1. [User Groups](https://github.com/ispeakc0de/chaos-charts/blob/kyverno-policies/security/kyverno-policies/allow-user-groups.yaml): It allows users groups for all the experiment pods

## Install Policies

These Kyverno policies are based on the [Kubernetes Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) definitons. To apply all pod security policies (recommended) [install Kyverno](https://kyverno.io/docs/installation/) and [kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/), then run:

```bash
kustomize build https://github.com/ispeakc0de/chaos-charts/kyverno-policies/security/kyverno | kubectl apply -f -
```
