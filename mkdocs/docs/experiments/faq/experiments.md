# The What, Why & How of Litmus

## Table of Contents

1. [Node memory hog experiment's pod OOM Killed even before the kubelet sees the memory stress?](#node-memory-hog-experiments-pod-oom-killed-even-before-the-kubelet-sees-the-memory-stress)

1. [Pod-network-corruption and pod-network-loss both experiments force network packet loss - is it worthwhile trying out both experiments in a scheduled chaos test?](#pod-network-corruption-and-pod-network-loss-both-experiments-force-network-packet-loss-is-it-worthwhile-trying-out-both-experiments-in-a-scheduled-chaos-test)

1. [How is the packet loss achieved in pod-network loss and corruption experiments? What are the internals of it?](#how-is-the-packet-loss-achieved-in-pod-network-loss-and-corruption-experiments-what-are-the-internals-of-it)

1. [What's the difference between pod-memory/cpu-hog vs pod-memory/cpu-hog-exec?](#whats-the-difference-between-pod-memorycpu-hog-vs-pod-memorycpu-hog-exec)

1. [What are the typical probes used for pod-network related experiments?](#what-are-the-typical-probes-used-for-pod-network-related-experiments)

1. [Litmus provides multiple libs to run some chaos experiments like stress-chaos and network chaos so which library should be preferred to use?](#litmus-provides-multiple-libs-to-run-some-chaos-experiments-like-stress-chaos-and-network-chaos-so-which-library-should-be-preferred-to-use)

1. [How to run chaos experiment programatically using apis?](#how-to-run-chaos-experiment-programatically-using-apis)

1. [Kubernetes by default has built-in features like replicaset/deployment to prevent service unavailability (continuous curl from the httpProbe on litmus should not fail) in case of container kill, pod delete and OOM due to pod-memory-hog then why do we need CPU, IO and network related chaos experiments?](#kubernetes-by-default-has-built-in-features-like-replicasetdeployment-to-prevent-service-unavailability-continuous-curl-from-the-httpprobe-on-litmus-should-not-fail-in-case-of-container-kill-pod-delete-and-oom-due-to-pod-memory-hog-then-why-do-we-need-cpu-io-and-network-related-chaos-experiments)

1. [The experiment is not targeting all pods with the given label, it just selects only one pod by default](#the-experiment-is-not-targeting-all-pods-with-the-given-label-it-just-selects-only-one-pod-by-default)

1. [Do we have a way to see what pods are targeted when users use percentages?](#do-we-have-a-way-to-see-what-pods-are-targeted-when-users-use-percentages)

1. [What is the function of spec.definition.scope of a ChaosExperiment CR?](#what-is-the-function-of-specdefinitionscope-of-a-chaosexperiment-cr)

1. [Pod network latency -- I have pod A talking to Pod B over Service B. and I want to introduce latency between Pod A and Service B. What would go into spec.appInfo section? Pod A namespace, label selector and kind? What will go into DESTINATION_IP and DESTINATION_HOST? Service B details? What are the TARGET_PODS?](#pod-network-latency-i-have-pod-a-talking-to-pod-b-over-service-b-and-i-want-to-introduce-latency-between-pod-a-and-service-b-what-would-go-into-specappinfo-section-pod-a-namespace-label-selector-and-kind-what-will-go-into-destination_ip-and-destination_host-service-b-details-what-are-the-target_pods)

1. [How to check the NETWORK_INTERFACE and SOCKET_PATH variable?](#how-to-check-the-network_interface-and-socket_path-variable)

1. [What are the different ways to target the pods and nodes for chaos?](#what-are-the-different-ways-to-target-the-pods-and-nodes-for-chaos)

1. [Does the pod affected perc select the random set of pods from the total pods under chaos?](#does-the-pod-affected-perc-select-the-random-set-of-pods-from-the-total-pods-under-chaos)

1. [How to extract the chaos start time and end time?](#how-to-extract-the-chaos-start-time-and-end-time)

1. [How do we check the MTTR (Mean time to recovery) for an application post chaos?](#how-do-we-check-the-mttr-mean-time-to-recovery-for-an-application-post-chaos)

1. [What is the difference between Ramp Time and Chaos Interval?](#what-is-the-difference-between-ramp-time-and-chaos-interval)

1. [When I’m executing an experiment the experiment's pod failed with the exec format error](#when-im-executing-an-experiment-the-experiments-pod-failed-with-the-exec-format-error)
  
<hr>

### Node memory hog experiment's pod OOM Killed even before the kubelet sees the memory stress?

The experiment takes a percentage of the total memory capacity of the Node. The helper pod runs on the target node to stress the resources of that node. So The experiment will not consume/hog the memory resources greater than the total memory available on Node. In other words there will always be an upper limit for the amount of memory to be consumed, which equal to the total available memory. Please refer to this [blog](https://dev.to/uditgaurav/litmuschaos-node-memory-hog-experiment-2nj6) for more details.

### Pod-network-corruption and pod-network-loss both experiments force network packet loss - is it worthwhile trying out both experiments in a scheduled chaos test?

Yes, ultimately these are different ways to simulate a degraded network. Both cases are expected to typically cause retransmissions (for tcp). The extent of degradation depends on the percentage of loss/corruption

### How is the packet loss achieved in pod-network loss and corruption experiments? What are the internals of it?

The experiment causes network degradation without the pod being marked unhealthy/unworthy of traffic by kube-proxy (unless you have a liveness probe of sorts that measures latency and restarts/crashes the container)
The idea of this exp is to simulate issues within your pod-network OR microservice communication across services in different availability zones/regions etc..,
Mitigation (in this case keep the timeout i.e., access latency low) could be via some middleware that can switch traffic based on some SLOs/perf parameters. If such an arrangement is not available - the next best thing would be to verify if such a degradation is highlighted via notification/alerts etc,. so the admin/SRE has the opportunity to investigate and fix things.
Another utility of the test would be to see what the extent of impact caused to the end-user OR the last point in the app stack on account of degradation in access to a downstream/dependent microservice. Whether it is acceptable OR breaks the system to an unacceptable degree.

The args passed to the tc netem command run against the target container changes depending on the type of n/w fault

### What's the difference between pod-memory/cpu-hog vs pod-memory/cpu-hog-exec?

The pod cpu and memory chaos experiment till now (version 1.13.7) was using an exec mode of execution which means - we were execing inside the specified target container and launching process like `md5sum` and `dd` to consume the cpu and memory respectively. This is done by providing `CHAOS_INJECT_COMMAND` and `CHAOS-KILL-COMMAND` in chaosengine CR. But we have some limitations of using this method. Those were:
    - The chaos inject and kill command are highly dependent on the base image of the target container and may work for some and for others you may have to derive it manually and use it.
    - For scratch images that don't expose shells we couldn't execute the chaos.

To overcome this - The stress-chaos experiments (cpu, memory and io) are enhanced to use a non exec mode of chaos execution. It makes use of target container cgroup for the resource allocation and container pid namespace for showing the stress-ng process in target container. This `stress-ng` process will consume the resources on the target container without doing an exec. The new enhanced experiments are available from litmus 1.13.8 version.

### What are the typical probes used for pod-network related experiments? 

Precisely the role of the experiment. Cause n/w degradation w/o the pod being marked unhealthy/unworthy of traffic by kube-proxy (unless you have a liveness probe of sorts that measures latency and restarts/crashes the container)
The idea of this exp is to simulate issues within your pod-network OR microservice communication across services in diff availability zones/regions etc..,

Mitigation (in this case keep the timeout i.e., access latency low) could be via some middleware that can switch traffic based on some SLOs/perf parameters. If such an arrangement is not available - the next best thing would be to verify if such a degradation is highlighted via notification/alerts etc,. so the admin/SRE has the opportunity to investigate and fix things.

Another utility of the test would be to see what the extent of impact caused to the end-user OR the last point in the app stack on account of degradation in access to a downstream/dependent microservice. Whether it is acceptable OR breaks the system to an unacceptable degree

### Litmus provides multiple libs to run some chaos experiments like stress-chaos and network chaos so which library should be preferred to use?

The optional libs (like Pumba) is more of an illustration of how you can use 3rd party tools with litmus. Called the BYOC (Bring Your Own Chaos). The preferred LIB is `litmus`.

### How to run chaos experiment programatically using apis?

To directly consume/manipulate the chaos resources (i.e., chaosexperiment, chaosengine or chaosresults) via API - you can directly use the kube API. The CRDs by default provide us with an API endpoint. You can use any generic client implementation (go/python are most used ones) to access them. In case you use go, there is a clientset available as well: [go-client](https://github.com/litmuschaos/chaos-operator/tree/master/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1)

Here are some simple CRUD ops against chaosresources you could construct with curl (I have used kubectl proxy, one could use an auth token instead)- just for illustration purposes.

#### Create ChaosEngine:

For example, assume this is the [engine spec](https://gist.github.com/ksatchit/7426f2c24a48e3aedbe79b5547d817b3)

```console
curl -s http://localhost:8001/apis/litmuschaos.io/v1alpha1/namespaces/default/chaosengines -XPOST -H 'Content-Type: application/json' -d@pod-delete-chaosengine-trigger.json
```

#### Read ChaosEngine status:

```console
curl -s http://localhost:8001/apis/litmuschaos.io/v1alpha1/namespaces/default/chaosengines/nginx-chaos | jq '.status.engineStatus, .status.experiments[].verdict'
```

#### Update ChaosEngine Spec:

(say, this is the patch: https://gist.github.com/ksatchit/be54955a1f4231314797f25361ac488d)

```console
curl --header "Content-Type: application/json-patch+json" --request PATCH --data '[{"op": "replace", "path": "/spec/engineState", "value": "stop"}]' http://localhost:8001/apis/litmuschaos.io/v1alpha1/namespaces/default/chaosengines/nginx-chaos
```

#### Delete the ChaosEngine resource:

```console
curl -X DELETE localhost:8001/apis/litmuschaos.io/v1alpha1/namespaces/default/chaosengines/nginx-chaos \
-d '{"kind":"DeleteOptions","apiVersion":"v1","propagationPolicy":"Foreground"}' \
-H "Content-Type: application/json"
```

#### Similarly, to check the results/verdict of the experiment from ChaosResult, you could use:

```console
curl -s http://localhost:8001/apis/litmuschaos.io/v1alpha1/namespaces/default/chaosresults/nginx-chaos-pod-delete | jq '.status.experimentStatus.verdict, .status.experimentStatus.probeSuccessPercentage'
```

### Kubernetes by default has built-in features like replicaset/deployment to prevent service unavailability (continuous curl from the httpProbe on litmus should not fail) in case of container kill, pod delete and OOM due to pod-memory-hog then why do we need CPU, IO and network related chaos experiments?

There are some scenarios that can still occur despite whatever availability aids K8s provides. For example, take disk usage or CPU hogs -- problems you would generally refer to as "Noisy Neighbour"  problems.
Stressing the disk w/ continuous and heavy I/O for example can cause degradation in reads and  writes performed by other microservices that use this shared disk - for example. (modern storage solutions for Kubernetes use the concept of storage pools out of which virtual volumes/devices are carved out).  Another issue is the amount of scratch space eaten up on a node - leading to lack of space for newer containers to get scheduled (kubernetes too gives up by applying an "eviction" taint like "disk-pressure") and causes a wholesale movement of all pods to other nodes.
Similarly w/ CPU chaos -- by injecting a rogue process into a target container, we starve the main microservice process (typically pid 1) of the resources allocated to it (where limits are defined) causing slowness in app traffic OR in other cases unrestrained use can cause node to exhaust resources leading to eviction of all pods.

###  The experiment is not targeting all pods with the given label, it just selects only one pod by default.

Yes. You can use either `the PODS_AFFECTED_PERCENTAGE` or `TARGET_PODS` env to select multiple pods. Refer: [experiment tunable envs](https://docs.litmuschaos.io/docs/pod-network-loss/#supported-experiment-tunables).

### Do we have a way to see what pods are targeted when users use percentages?

We can view the target pods from the experiment logs or inside chaos results.

### What is the function of spec.definition.scope of a ChaosExperiment CR?

The `spec.definition.scope` & `.spec.definition.permissions` is mostly for indicative/illustration purposes (for external tools to identify and validate what are the permissions associated to run the exp). By itself, it doesn't influence how and where an exp can be used.One could remove these fields if needed (of course along w/ the crd validation) and store these manifests if desired.

### In Pod network latency - I have pod A talking to Pod B over Service B. and I want to introduce latency between Pod A and Service B. What would go into spec.appInfo section? Pod A namespace, label selector and kind? What will go into DESTINATION_IP and DESTINATION_HOST? Service B details? What are the TARGET_PODS?

It will target the `[1:total_replicas]`(based on PODS_AFFECTED_PERC) numbers of random pods with matching labels(appinfo.applabel) and namespace(appinfo.appns). But if you want to target a specific pod then you can provide their names as a comma separated list inside `TARGET_PODS`.
Yes, you can provide service B details inside `DESTINATION_IPS` or `DESTINATION_HOSTS`. The `NETWORK_INTERFACE` should be `eth0`.

### How to check the NETWORK_INTERFACE and SOCKET_PATH variable?

The `NETWORK_INTERFACE` is the interface name inside the pod/container that needs to be targeted. You can find it by execing into the target pod and checking the available interfaces. You can try `ip link`, `iwconfig` , `ifconfig` depending on the tools installed in the pod either of those could work.

The `SOCKET_PATH` by default takes the docker socket path. If you are using something else like containerd, crio or have a different socket path by any chance you can specify it. This is required to communicate with the container runtime of your cluster. 
In addition to this if container-runtime is different then provide the name of container runtime inside `CONTAINER_RUNTIME` ENV. It supports `docker`, `containerd`, and `crio` runtimes.    

### What are the different ways to target the pods and nodes for chaos?

The different ways are: 

Pod Chaos: 
    - `Appinfo`: Provide the target pod labels in the chaos engine appinfo section.
    - `TARGET_PODS`: You can provide the target pod names as a Comma Separated Variable. Like pod1,pod2.

Node Chaos:
    - `TARGET_NODE` or `TARGET_NODES`: Provide the target node or nodes in these envs.
    - `NODE_LABEL`: Provide the label of the target nodes.

### Does the pod affected percentage select the random set of pods from the total pods under chaos?

Yes, it selects the random pods based on the `POD_AFFACTED_PERC` ENV. In pod-delete experiment it selects random pods for each iterations of chaos. But for rest of the experiments(if it supports iterations) then it will select random pods once and use the same set of pods for remaining iterations.

### How to extract the chaos start time and end time?

We can use the Chaos exporter metrics for the same. One can also visualise these events along with time in chaos engine events.

### How do we check the MTTR (Mean time to recovery) for an application post chaos?

The MTTR can be validated by using statusCheck Timeout in the chaos engine. By default its value will be 180 seconds. We can also overwrite this using ChaosEngine. For more details refer [this](https://litmuschaos.github.io/litmus/experiments/chaos-resources/experiment-components/#experiment-status-check-timeout)

### What is the difference between Ramp Time and Chaos Interval?

The ramp time is the time duration to wait before and after injection of chaos in seconds. While the chaos interval is the time interval (in second) between successive chaos iterations.

### When I’m executing an experiment the experiment's pod failed with the exec format error

??? info "View the error message" 
    ```
    standard_init_linux.go:211: exec user process caused "exec format error":
    ```
    
There could be multiple reasons for this. The most common one is mismatched in the binary and the platform on which it is running, try to check out the image binary you're using should have the support for the platform on which you’re trying to run the experiment.
