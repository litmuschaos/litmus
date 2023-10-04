# Experiments

The experiment execution is triggered upon creation of the ChaosEngine resource (various examples of which are provided under the respective experiments). Typically, these chaosengines are embedded within the 'steps' of a Litmus Chaos Workflow [here](https://litmusdocs-beta.netlify.app/). However, one may also create the chaos engines directly by hand, and the chaos-operator reconciles this resource and triggers the experiment execution.

Provided below are tables with links to the individual experiment docs for easy navigation

## Kubernetes Experiments

It contains chaos experiments which apply on the resources, which are running on the kubernetes cluster. It contains <code>Generic</code> experiments.

Following Kubernetes Chaos experiments are available:

### Generic

Chaos actions that apply to generic Kubernetes resources are classified into this category. Following chaos experiments are supported under Generic Chaos Chart

#### Pod Chaos
<table>
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>Container Kill</td>
    <td>Kills the container in the application pod</td>
    <td><a href="/litmus/experiments/categories/pods/container-kill">container-kill</a></td>
  </tr>
  <tr>
    <td>Disk Fill</td>
    <td>Fillup Ephemeral Storage of a Resourced</td>
    <td><a href="/litmus/experiments/categories/pods/disk-fill">disk-fill</a></td>
  </tr>
  <tr>
    <td>Pod Autoscaler</td>
    <td>Scales the application replicas and test the node autoscaling on cluster</td>
    <td><a href="/litmus/experiments/categories/pods/pod-autoscaler">pod-autoscaler</a></td>
  </tr>
  <tr>
    <td>Pod CPU Hog Exec</td>
    <td>Consumes CPU resources on the application container by invoking a utility within the app container base image</td>
    <td><a href="/litmus/experiments/categories/pods/pod-cpu-hog-exec">pod-cpu-hog-exec</a></td>
  </tr>
  <tr>
    <td>Pod CPU Hog</td>
    <td>Consumes CPU resources on the application container</td>
    <td><a href="/litmus/experiments/categories/pods/pod-cpu-hog">pod-cpu-hog</a></td>
  </tr>
  <tr>
    <td>Pod Delete</td>
    <td>Deletes the application pod </td>
    <td><a href="/litmus/experiments/categories/pods/pod-delete">pod-delete</a></td>
  </tr>
  <tr>
    <td>Pod DNS Error</td>
    <td>Disrupt dns resolution in kubernetes po</td>
    <td><a href="/litmus/experiments/categories/pods/pod-dns-error">pod-dns-error</a></td>
  </tr>
  <tr>
    <td>Pod DNS Spoof</td>
    <td>Spoof dns resolution in kubernetes pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-dns-spoof">pod-dns-spoof</a></td>
  </tr>
  <tr>
    <td>Pod IO Stress</td>
    <td>Injects IO stress resources on the application container</td>
    <td><a href="/litmus/experiments/categories/pods/pod-io-stress">pod-io-stress</a></td>
  </tr>
  <tr>
    <td>Pod Memory Hog Exec</td>
    <td>Consumes Memory resources on the application container by invoking a utility within the app container base image</td>
    <td><a href="/litmus/experiments/categories/pods/pod-memory-hog-exec">pod-memory-hog-exec</a></td>
  </tr>
  <tr>
    <td>Pod Memory Hog</td>
    <td>Consumes Memory resources on the application container</td>
    <td><a href="/litmus/experiments/categories/pods/pod-memory-hog">pod-memory-hog</a></td>
  </tr>
  <tr>
    <td>Pod Network Corruption</td>
    <td>Injects Network Packet Corruption into Application Pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-network-corruption">pod-network-corruption</a></td>
  </tr>
  <tr>
    <td>Pod Network Duplication</td>
    <td>Injects Network Packet Duplication into Application Pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-network-duplication">pod-network-duplication</a></td>
  </tr>
  <tr>
    <td>Pod Network Latency</td>
    <td>Injects Network latency into Application Pod</td>
   <td><a href="/litmus/experiments/categories/pods/pod-network-latency">pod-network-latency</a></td>
  </tr>
  <tr>
    <td>Pod Network Loss</td>
    <td>Injects Network loss into Application Pod</td>
   <td><a href="/litmus/experiments/categories/pods/pod-network-loss">pod-network-loss</a></td>
  </tr>
  <tr>
    <td>Pod HTTP Latency</td>
    <td>Injects HTTP latency into Application Pod</td>
   <td><a href="/litmus/experiments/categories/pods/pod-http-latency">pod-http-latency</a></td>
  </tr>
  <tr>
    <td>Pod HTTP Reset Peer</td>
    <td>Injects HTTP reset peer into Application Pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-http-reset-peer">pod-http-reset-peer</a></td>
  </tr>
  <tr>
    <td>Pod HTTP Status Code</td>
    <td>Injects HTTP status code chaos into Application Pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-http-status-code">pod-http-status-code</a></td>
  </tr>
  <tr>
    <td>Pod HTTP Modify Body</td>
    <td>Injects HTTP modify body into Application Pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-http-modify-body">pod-http-modify-body</a></td>
  </tr>
  <tr>
    <td>Pod HTTP Modify Header</td>
    <td>Injects HTTP Modify Header into Application Pod</td>
    <td><a href="/litmus/experiments/categories/pods/pod-http-modify-header">pod-http-modify-header</a></td>
  </tr>
</table>

#### Node Chaos

<table style="width: 100%;">
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>Docker Service Kill</td>
    <td>Kills the docker service on the application node</td>
    <td><a href="/litmus/experiments/categories/nodes/docker-service-kill">docker-service-kill</a></td>
  </tr>
  <tr>
    <td>Kubelet Service Kill</td>
    <td>Kills the kubelet service on the application node</td>
    <td><a href="/litmus/experiments/categories/nodes/kubelet-service-kill">kubelet-service-kill</a></td>
  </tr>
  <tr>
    <td>Node CPU Hog</td>
    <td>Exhaust CPU resources on the Kubernetes Node</td>
    <td><a href="/litmus/experiments/categories/nodes/node-cpu-hog">node-cpu-hog</a></td>
  </tr>
  <tr>
    <td>Node Drain</td>
    <td>Drains the target node</td>
    <td><a href="/litmus/experiments/categories/nodes/node-drain">node-drain</a></td>
  </tr>
  <tr>
    <td>Node IO Stress</td>
    <td>Injects IO stress resources on the application node</td>
    <td><a href="/litmus/experiments/categories/nodes/node-io-stress">node-io-stress</a></td>
  </tr>
  <tr>
    <td>Node Memory Hog</td>
    <td>Exhaust Memory resources on the Kubernetes Node</td>
    <td><a href="/litmus/experiments/categories/nodes/node-memory-hog">node-memory-hog</a></td>
  </tr>
  <tr>
    <td>Node Restart</td>
    <td> Restarts the target node</td>
    <td><a href="/litmus/experiments/categories/nodes/node-restart">node-restart</a></td>
  </tr>
  <tr>
    <td>Node Taint</td>
    <td>Taints the target node</td>
    <td><a href="/litmus/experiments/categories/nodes/node-taint">node-taint</a></td>
  </tr>
</table>

### Application Chaos

While Chaos Experiments under the Generic category offer the ability to induce chaos into Kubernetes resources, it is difficult to analyze and conclude if the chaos induced found a weakness in a given application. The application specific chaos experiments are built with some checks on *pre-conditions* and some expected outcomes after the chaos injection. The result of the chaos experiment is determined by matching the outcome with the expected outcome. 

<table style="width: 100%;">
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>Spring Boot App Kill</td>
    <td>Kill the spring boot application</td>
    <td><a href="/litmus/experiments/categories/spring-boot/spring-boot-app-kill">spring-boot-app-kill</a></td>
  </tr>
  <tr>
    <td>Spring Boot CPU Stress</td>
    <td>Stress the CPU of the spring boot application</td>
    <td><a href="/litmus/experiments/categories/spring-boot/spring-boot-cpu-stress">spring-boot-cpu-stress</a></td>
  </tr>
  <tr>
    <td>Spring Boot Memory Stress</td>
    <td>Stress the memory of the spring boot application</td>
    <td><a href="/litmus/experiments/categories/spring-boot/spring-boot-memory-stress">spring-boot-memory-stress</a></td>
  </tr>
  <tr>
    <td>Spring Boot Latency </td>
    <td>Inject latency to the spring boot application network</td>
    <td><a href="/litmus/experiments/categories/spring-boot/spring-boot-latency">spring-boot-latency</a></td>
  </tr>
  <tr>
    <td>Spring Boot Exception</td>
    <td>Raise exceptions to the spring boot application</td>
    <td><a href="/litmus/experiments/categories/spring-boot/spring-boot-exceptions">spring-boot-exceptions</a></td>
  </tr>
  <tr>
    <td>Spring Boot Faults</td>
    <td>It injects the multiple spring boot faults simultaneously on the target pods</td>
    <td><a href="/litmus/experiments/categories/spring-boot/spring-boot-faults">spring-boot-faults</a></td>
  </tr>
</table>

<hr/>

##  Cloud Infrastructure

Chaos experiments that inject chaos into the platform resources of Kubernetes are classified into this category. Management of platform resources vary significantly from each other, Chaos Charts may be maintained separately for each platform (For example, AWS, GCP, Azure, etc)

Following Platform Chaos experiments are available:

### AWS

<table style="width: 100%;">
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>EC2 Stop By ID</td>
    <td>Stop the EC2 instance matched by instance id</td>
    <td><a href="/litmus/experiments/categories/aws/ec2-stop-by-id">ec2-stop-by-id</a></td>
  </tr>
  <tr>
    <td>EC2 Stop By Tag</td>
    <td>Stop the EC2 instance matched by instance tag</td>
    <td><a href="/litmus/experiments/categories/aws/ec2-stop-by-tag">ec2-stop-by-tag</a></td>
  </tr>
  <tr>
    <td>EBS Loss By ID</td>
    <td>Detach the EBS volume matched by volume id</td>
    <td><a href="/litmus/experiments/categories/aws/ebs-loss-by-id">ebs-loss-by-id</a></td>
  </tr>
  <tr>
    <td>EBS Loss By Tag</td>
    <td>Detach the EBS volume matched by volume tag</td>
    <td><a href="/litmus/experiments/categories/aws/ebs-loss-by-tag">ebs-loss-by-tag</a></td>
  </tr>
</table>

### GCP

<table style="width: 100%;">
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>GCP VM Instance Stop</td>
    <td>Stop the gcp vm instance</td>
    <td><a href="/litmus/experiments/categories/gcp/gcp-vm-instance-stop">gcp-vm-instance-stop</a></td>
  </tr>
  <tr>
    <td>GCP VM Disk Loss</td>
    <td>Detach the gcp disk</td>
    <td><a href="/litmus/experiments/categories/gcp/gcp-vm-disk-loss">gcp-vm-disk-loss</a></td>
  </tr>
</table>

### Azure

<table style="width: 100%;">
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>Azure Instance Stop</td>
    <td>Stop the azure instance</td>
    <td><a href="/litmus/experiments/categories/azure/azure-instance-stop">azure-instance-stop</a></td>
  </tr>
  <tr>
    <td>Azure Disk Loss</td>
    <td>Detach azure disk from instance</td>
    <td><a href="/litmus/experiments/categories/azure/azure-disk-loss">azure-disk-loss</a></td>
  </tr>
</table>

### VMWare

<table style="width: 100%;">
  <tr>
    <th>Experiment Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>VM Poweroff</td>
    <td>Poweroff the vmware VM</td>
    <td><a href="/litmus/experiments/categories/vmware/vm-poweroff">vm-poweroff</a></td>
  </tr>
</table>
