---
hide:
  - toc
---
# Litmus Experiments

## Table of Contents

1. [When I’m executing an experiment the experiment's pod failed with the exec format error](#when-im-executing-an-experiment-the-experiments-pod-failed-with-the-exec-format-error)

1. [Nothing happens (no pods created) when the chaosengine resource is created?](#nothing-happens-no-pods-created-when-the-chaosengine-resource-is-created)

1. [The chaos-runner pod enters completed state seconds after getting created. No experiment jobs are created?](#the-chaos-runner-pod-enters-completed-state-seconds-after-getting-created-no-experiment-jobs-are-created)

1. [The experiment pod enters completed state w/o the desired chaos being injected?](#the-experiment-pod-enters-completed-state-wo-the-desired-chaos-being-injected)

1. [Observing experiment results using describe chaosresult is showing NotFound error?](#observing-experiment-results-using-describe-chaosresult-is-showing-notfound-error)

1. [The helper pod is getting in a failed state due to container runtime issue](#the-helper-pod-is-getting-in-a-failed-state-due-to-container-runtime-issue)

1. [Disk Fill fail with the error message](#disk-fill-fail-with-the-error-message)

1. [Disk Fill failed with error](#disk-fill-failed-with-error)

1. [Disk fill experiment fails with an error pointing to the helper pods being unable to finish in the given duration](#disk-fill-experiment-fails-with-an-error-pointing-to-the-helper-pods-being-unable-to-finish-in-the-given-duration)

1. [The infra experiments like node drain, node taint, kubelet service kill to act on the litmus pods only](#the-infra-experiments-like-node-drain-node-taint-kubelet-service-kill-to-act-on-the-litmus-pods-only)

1. [AWS experiments failed with the following error](#aws-experiments-failed-with-the-following-error)

1. [In AWS SSM Chaos I have provided the aws in secret but still not able to inject the SSM chaos on the target instance](#in-aws-ssm-chaos-i-have-provided-the-aws-in-secret-but-still-not-able-to-inject-the-ssm-chaos-on-the-target-instance)

1. [GCP VM Disk Loss experiment fails unexpectedly where the disk gets detached successfully but fails to attach back to the instance. What can be the reason?](#gcp-vm-disk-loss-experiment-fails-unexpectedly-where-the-disk-gets-detached-successfully-but-fails-to-attach-back-to-the-instance-what-can-be-the-reason)

1. [In pod level stress chaos experiments like pod memory hog or pod io stress after the chaos is injected successfully the helper fails with an error message](#in-pod-level-stress-chaos-experiments-like-pod-memory-hog-or-pod-io-stress-after-the-chaos-is-injected-successfully-the-helper-fails-with-an-error-message)

1. [Experiment failed for the istio enabled namespaces](#experiment-failed-for-the-istio-enabled-namespaces)

### When I’m executing an experiment the experiment's pod failed with the exec format error

??? info "View the error message" 
    standard_init_linux.go:211: exec user process caused "exec format error":
    
There could be multiple reasons for this. The most common one is mismatched in the binary and the platform on which it is running, try to check out the image binary you're using should have the support for the platform on which you’re trying to run the experiment.

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

#### Some of the possible reasons for these errors include:

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

#### Some of the possible reasons may include: 

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

#### Some of the possible reasons may include: 

- The ChaosExperiment CR or the ChaosEngine CR doesn’t include mandatory ENVs  (or consists of incorrect values/info) 
  needed by the experiment. Note that each experiment (see docs) specifies a mandatory set of ENVs along with some 
  optional ones, which are necessary for successful execution of the experiment. 

- The chaosServiceAccount specified in the ChaosEngine CR doesn’t have sufficient permissions to create the experiment 
  helper-resources (i.e., some experiments in turn create other K8s resources like Jobs/Daemonsets/Deployments etc..,
  For existing experiments, appropriate rbac manifests are already provided in chaos-charts/docs)

- The application's (AUT) unique label provided in the ChaosEngine is set only at the parent resource metadata but not 
  propagated to the pod template spec. Note that the Operator uses this label to filter chaos candidates at the parent 
  resource level (deployment/statefulset/daemonset) but the experiment pod uses this to pick application *pods* into 
  which the chaos is injected. 

- The experiment pre-chaos checks have failed on account of application (AUT) or auxiliary application unavailability

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

### The helper pod is getting in a failed state due to container runtime issue

??? info "View the error message"
    time="2021-07-15T10:26:04Z" level=fatal msg="helper pod failed, err: Unable to run command, err: exit status 1; error output: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?"

    <center>OR</center>

    time="2021-07-16T22:21:02Z" level=error msg="[docker]: Failed to run docker inspect: []\nError: No such object: 1807fec21ccad1101bbb63a7d412be15414f807316572f9e043b9f4a3e7c4acc\n"
    time="2021-07-16T22:21:02Z" level=fatal msg="helper pod failed, err: exit status 1"

The default values for `CONTAINER_RUNTIME` & `SOCKET_PATH` env is for `docker` runtime. Please check if the cluster runtime is other than docker i.e, containerd then update above ENVs as follow:

- For containerd runtime: 
    - `CONTAINER_RUNTIME`: containerd
    -  `SOCKET_PATH`: /run/containerd/containerd.sock

- For CRIO runtime:
    - `CONTAINER_RUNTIME`: crio
    - `SOCKET_PATH`: /run/crio/crio.sock

`NOTE`: The above values are the common ones and may vary based on the cluster you’re using.

### Disk Fill fail with the error message

??? info "View the error message"
    time="2021-08-12T05:27:39Z" level=fatal msg="helper pod failed, err: either provide ephemeral storage limit inside target container or define EPHEMERAL_STORAGE_MEBIBYTES ENV"

The disk fill experiment needs to have either ephemeral storage limit defined in the application or you can provide the value in mebibytes using 
`EPHEMERAL_STORAGE_MEBIBYTES` ENV in the chaos engine. Either of them is required. For more details refer: [FILL_PERCENTAGE](https://litmuschaos.github.io/litmus/experiments/categories/pods/disk-fill/#disk-fill-percentage) and [EPHEMERAL_STORAGE_MEBIBYTES](https://litmuschaos.github.io/litmus/experiments/categories/pods/disk-fill/#disk-fill-mebibytes)

### Disk Fill failed with error:

??? info "View the error message"
    time="2021-08-12T05:41:45Z" level=error msg="du: /diskfill/8a1088e3fd50a31d5f0d383ae2258d9975f1df152ff92b3efd570a44e952a732: No such file or directory\n"
    time="2021-08-12T05:41:45Z" level=fatal msg="helper pod failed, err: exit status 1"

This could be due to multiple issues in filling the disk of a container the most common one is invalid CONTAINER_PATH env set in the chaosengine. The default container path env is common for most of the use-cases and that is `/var/lib/docker/containers` 

### Disk fill experiment fails with an error pointing to the helper pods being unable to finish in the given duration.

This could be possible when the provided block size is quite less and the empirical storage value is high. In this case, it may need more time than the given chaos duration to fill the disk.

### The infra experiments like node drain, node taint, kubelet service kill to act on the litmus pods only.

Ans: These are the infra level experiments, we need to cordon the target node so that the application pods don’t get scheduled on it and use node selector in the chaos engine to specify the nodes for the experiment pods. Refer to the [this](https://litmuschaos.github.io/litmus/experiments/chaos-resources/chaos-engine/experiment-components/#experiment-nodeselectors) to know how to schedule experiments on a certain node.

### AWS experiments failed with the following error

??? info "View the error message"
    time="2021-08-12T10:25:57Z" level=error msg="failed perform ssm api calls, err: UnrecognizedClientException: The security token included in the request is invalid.\n\tstatus code: 400, request id: 68f0c2e8-a7ed-4576-8c75-0a3ed497efb9" 

The AWS experiment needs authentication to connect & perform actions on the aws services we can provide this with the help of the secret as shown below:

??? note "View the secret manifest"
    ```
    apiVersion: v1
    kind: Secret
    metadata:
      name: cloud-secret
    type: Opaque
    stringData:
      cloud_config.yml: |-
        # Add the cloud AWS credentials respectively
        [default]
        aws_access_key_id = XXXXXXXXXXXXXXXXXXX
        aws_secret_access_key = XXXXXXXXXXXXXXX
    ```

Make sure you have all the required permissions attached with your IAM to perform the chaos operation on the given service.
If you are running the experiment in an EKS cluster then you have one more option than creating a secret, you can map the IAM role with the service account refer to [this](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for more details.

### In AWS SSM Chaos I have provided the aws in secret but still not able to inject the SSM chaos on the target instance

??? info "View the error message"
    time='2021-08-13T09:30:47Z' level=error msg='failed perform ssm api calls, err: error: the instance id-qqw2-123-12- might not have suitable permission or IAM attached to it. use \'aws ssm describe-instance-information\' to check the available instances'

Ensure that you have the required AWS access and your target EC2 instances have attached an IAM instance profile. To know more checkout [Systems Manager Docs](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-launch-managed-instance.html)

### GCP VM Disk Loss experiment fails unexpectedly where the disk gets detached successfully but fails to attach back to the instance. What can be the reason?

The GCP VM Disk Loss experiment requires a GCP Service Account having a Project Editor or higher permission to execute. This could be because of an issue in the GCP GoLang Compute Engine API, which fails to attach the disk using the attachDisk method with a Compute Admin or lower permission.

### In pod level stress chaos experiments like pod memory hog or pod io stress after the chaos is injected successfully the helper fails with an error message

??? info "View the error message"
    Error: process exited before the actual cleanup

The error message indicates that the stress process inside the target container is somehow removed before the actual cleanup. There could be multiple reasons for this: the target container might have just got restarted due to excessive load on the container which it can’t handle and the kubelet terminated that replica and launches a new one (if applicable) and reports an OOM event on the older one.

### Experiment failed for the istio enabled namespaces

??? info "View the error message"
    W0817 06:32:26.531145       1 client_config.go:541] Neither --kubeconfig nor --master was specified.  Using the inClusterConfig.  This might not work.
    time="2021-08-17T06:32:26Z" level=error msg="unable to get ChaosEngineUID, error: unable to get ChaosEngine name: pod-delete-chaos, in namespace: default, error: Get \"https://10.100.0.1:443/apis/litmuschaos.io/v1alpha1/namespaces/default/chaosengines/pod-delete-chaos\": dial tcp 10.100.0.1:443: connect: connection refused"

If istio is enabled for the `chaos-namespace`, it will launch the chaos-runner and chaos-experiment pods with the istio sidecar. Which may block/delay the external traffic of those pods for the intial few seconds. Which can fail the experiment.

We can fix the above failure by avoiding istio sidecar for the chaos pods. Refer the following manifest:

??? note "View the ChaosEngine manifest with the required annotations"
    ```
    apiVersion: litmuschaos.io/v1alpha1
    kind: ChaosEngine
    metadata:
      name: engine-nginx
    spec:
      components:
        runner:
          # annotation for the chaos-runner
          runnerAnnotations:
            sidecar.istio.io/inject: "false"
      engineState: "active"
      annotationCheck: "false"
      appinfo:
        appns: "default"
        applabel: "app=nginx"
        appkind: "deployment"
      chaosServiceAccount: container-kill-sa
      experiments:
      - name: container-kill
        spec:
          components:
            #annotations for the experiment pod 
            experimentAnnotations:
              sidecar.istio.io/inject: "false"
            env:
            - name: TOTAL_CHAOS_DURATION
              value: '60'
    ```