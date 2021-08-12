# Troubleshooting Litmus

## Table of Contents

1. [The Litmus chaos operator is seen to be in CrashLoopBackOff state immediately after installation?](#the-litmus-chaosoperator-is-seen-to-be-in-crashloopbackoff-state-immediately-after-installation)

1. [Nothing happens (no pods created) when the chaosengine resource is created?](#nothing-happens-no-pods-created-when-the-chaosengine-resource-is-created)

1. [The chaos-runner pod enters completed state seconds after getting created. No experiment jobs are created?](#the-chaos-runner-pod-enters-completed-state-seconds-after-getting-created-no-experiment-jobs-are-created)

1. [The experiment pod enters completed state w/o the desired chaos being injected?](#the-experiment-pod-enters-completed-state-wo-the-desired-chaos-being-injected)
  
1. [Scheduler not forming chaosengines for type-repeat?](#scheduler-not-forming-chaosengines-for-typerepeat)

1. [Litmus uninstallation is not successful and namespace is stuck in terminating state?](#litmus-uninstallation-is-not-successful-and-namespace-is-stuck-in-terminating-state)

1. [Observing experiment results using describe chaosresult is showing NotFound error?](#observing-experiment-results-using-describe-chaosresult-is-showing-notfound-error)

<hr>

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

### Nothing happens (no pods created) when the chaosengine resource is created?

If the ChaosEngine creation results in no action at all, perform the following checks: 

- Check the Kubernetes events generated against the chaosengine resource. 


  ```
  kubectl describe chaosengine <chaosengine-name> -n <namespace>
  ```

  Specifically look for the event reason *ChaosResourcesOperationFailed*. Typically, these events consist of messages pointing to the 
  problem. Some of the common messages include: 

   - *Unable to filter app by specified info*
   - *Unable to get chaos resources*
   - *Unable to update chaosengine*

- Check the logs of the chaos-operator pod using the following command to get more details (on failed creation of chaos resources). 
  The below example uses litmus namespace, which is the default mode of installation. Please provide the namespace into which the 
  operator has been deployed: 

  ```console
  kubectl logs -f <chaos-operator-(hash)-(hash)>-runner -n litmus
  ```

Some of the possible reasons for these errors include:

- The annotationCheck is set to `true` in the ChaosEngine spec, but the application deployment (AUT) has not 
  been annotated for chaos. If so, please add it using the following command: 

  ```console
  kubectl annotate <deploy-type>/<application_name> litmuschaos.io/chaos="true"
  ```

- The annotationCheck is set to `true` in the ChaosEngine spec and there are multiple chaos candidates that 
  share the same label (as provided in the `.spec.appinfo` of the ChaosEngine) and are also annotated for chaos. 
  If so, please provide a unique label for the AUT, or remove annotations on other applications with the same label. 
  Litmus, by default, doesn't allow selection of multiple applications. If this is a requirement, set the 
  annotationCheck to `false`. 

  ```console
  kubectl annotate <deploy-type>/<application_name> litmuschaos.io/chaos-
  ```
- The ChaosEngine has the `.spec.engineState` set to `stop`, which causes the operator to refrain from creating chaos 
  resources. While it is an unlikely scenario, it is possible to reuse a previously modified ChaosEngine manifest.

- Verify if the service account used by the Litmus ChaosOperator has enough permissions to launch pods/services 
  (this is available by default if the manifests suggested by the docs have been used).

### The chaos-runner pod enters completed state seconds after getting created. No experiment jobs are created?
 
If the chaos-runner enters completed state immediately post creation, i.e., the creation of experiment resources is 
unsuccessful, perform the following checks: 

- Check the Kubernetes events generated against the chaosengine resource. 

  ```
  kubectl describe chaosengine <chaosengine-name> -n <namespace>
  ```

  Look for one of these events: *ExperimentNotFound*, *ExperimentDependencyCheck*, *EnvParseError* 

- Check the logs of the chaos-runner pod logs.  

  ```console
  kubectl logs -f <chaosengine_name>-runner -n <namespace>
  ```

Some of the possible reasons may include: 

- The ChaosExperiment CR for the experiment (name) specified in the ChaosEngine .spec.experiments list is not installed. 
  If so, please install the desired experiment from the [chaoshub](https://hub.litmuschaos.io)

- The dependent resources for the ChaosExperiment, such as ConfigMap & secret volumes (as specified in the ChaosExperiment CR 
  or the ChaosEngine CR) may not be present in the cluster (or in the desired namespace). The runner pod doesn’t proceed 
  with creation of experiment resources if the dependencies are unavailable.  

- The values provided for the ENV variables in the ChaosExperiment or the ChaosEngines might be invalid

- The chaosServiceAccount specified in the ChaosEngine CR doesn’t have sufficient permissions to create the experiment 
  resources (For existing experiments, appropriate rbac manifests are already provided in chaos-charts/docs).

### The experiment pod enters completed state w/o the desired chaos being injected? 

If the experiment pod enters completed state immediately (or in a few seconds) after creation w/o injecting the desired chaos, 
perform the following checks: 

- Check the Kubernetes events generated against the ChaosEngine resource

  ```
  kubectl describe chaosengine <chaosengine-name> -n <namespace>
  ```

  Look for the event with reason *Summary* with message *<experiment-name> experiment has been failed*

- Check the logs of the chaos-experiment pod. 

  ```console
  kubectl logs -f <experiment_name_(hash)_(hash)> -n <namespace>
  ```

Some of the possible reasons may include: 

- The ChaosExperiment CR or the ChaosEngine CR doesn’t include mandatory ENVs  (or consists of incorrect values/info) 
  needed by the experiment. Note that each experiment (see docs) specifies a mandatory set of ENVs along with some 
  optional ones, which are necessary for successful execution of the experiment. 

- The chaosServiceAccount specified in the ChaosEngine CR doesn’t have sufficient permissions to create the experiment 
  helper-resources (i.e., some experiments in turn create other K8s resources like Jobs/Daemonsets/Deployments etc..,
  For existing experiments, appropriate rbac manifests are already provided in chaos-charts/docs).  

- The application's (AUT) unique label provided in the ChaosEngine is set only at the parent resource metadata but not 
  propagated to the pod template spec. Note that the Operator uses this label to filter chaos candidates at the parent 
  resource level (deployment/statefulset/daemonset) but the experiment pod uses this to pick application **pods** into 
  which the chaos is injected. 

- The experiment pre-chaos checks have failed on account of application (AUT) or auxiliary application unavailability

### Scheduler not forming chaosengines for type=repeat?

If the ChaosSchedule has been created successfully created in the cluster and ChaosEngine is not being formed, the most common problem is that either start or 
end time has been wrongly specified. We should verify the times. We can identify if this is the problem or not by changing to `type=now`. If the ChaosEngine is 
formed successfully then the problem is with the specified time ranges, if ChaosEngine is still not formed, then the problem is with `engineSpec`. 


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

### Observing experiment results using `describe chaosresult` is showing `NotFound` error?

Upon observing the ChaosResults by executing the describe command given below, it may give a `NotFound` error. 

```
kubectl describe chaosresult <chaos-engine-name>-<chaos-experiment-name>  -n <namespace>
```

Alternatively, running the describe command without specifying the expected ChaosResult name might execute successfully, but does may not show any output. 

```
kubectl describe chaosresult  -n <namespace>`
```
 
This can occur sometimes due to the time taken in pulling the image starting the experiment pod (note that the ChaosResult resource is generated by the experiment). 
For the above commands to execute successfully, you should simply wait for the experiment pod to be created. The waiting time will be based upon resource available
(network bandwidth, space availability on the node filesyste