---
hide:
  - toc
---
# Install

## Table of Contents

1. [The Litmus ChaosOperator is seen to be in CrashLoopBackOff state immediately after installation?](#the-litmus-chaosoperator-is-seen-to-be-in-crashloopbackoff-state-immediately-after-installation)

1. [Litmus uninstallation is not successful and namespace is stuck in terminating state?](#litmus-uninstallation-is-not-successful-and-namespace-is-stuck-in-terminating-state)

### The Litmus ChaosOperator is seen to be in CrashLoopBackOff state immediately after installation?

Verify if the ChaosEngine custom resource definition (CRD) has been installed in the cluster. This can be 
verified with the following commands: 

```console
kubectl get crds | grep chaos
```
```console
kubectl api-resources | grep chaos
```

If not created, install it from [here](https://github.com/litmuschaos/chaos-operator/blob/master/deploy/crds/chaosengine_crd.yaml)

### Litmus uninstallation is not successful and namespace is stuck in terminating state?

Under typical operating conditions, the ChaosOperator makes use of finalizers to ensure that the ChaosEngine is deleted 
only after chaos resources (chaos-runner, experiment pod, any other helper pods) are removed. 

When uninstalling Litmus via the operator manifest (which contains the namespace, operator, crd specifictions in a single YAML) 
without deleting the existing chaosengine resources first, the ChaosOperator deployment may get deleted before the CRD removal 
is attempted. Since the stale chaosengines have the finalizer present on them, their deletion (triggered by the CRD delete) and 
by consequence, the deletion of the chaosengine CRD itself is "stuck". 

In such cases, manually remove the finalizer entries on the stale chaosengines to facilitate their successful delete. 
To get the chaosengine, run:
 
 `kubectl get chaosengine -n <namespace>`

followed by:

 `kubectl edit chaosengine <chaosengine-name> -n <namespace>` and remove the finalizer entry `chaosengine.litmuschaos.io/finalizer`

Repeat this on all the stale chaosengine CRs to remove the CRDs successfully & complete uninstallation process.

If however, the `litmus` namespace deletion remains stuck despite the above actions, follow the procedure described 
[here](https://success.docker.com/article/kubernetes-namespace-stuck-in-terminating) to complete the uninstallation. 
