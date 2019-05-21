# Litmus

[![Build Status](https://travis-ci.org/litmuschaos/litmus.svg?branch=master)](https://travis-ci.org/litmuschaos/litmus)
[![Docker Pulls](https://img.shields.io/docker/pulls/openebs/ansible-runner.svg)](https://hub.docker.com/r/openebs/ansible-runner)

Litmus is chaos engineering for workloads on Kubernetes -> hopefully without learning curves. Our vision 
includes enabling end users to easily execute chaos experiments in their environments using a Kubernetes native 
approach, where the chaos intent is specified in a declarative way.

https://litmuschaos.io/

## Overview

The primary objective of Litmus is to ensure a consistent and reliable behavior of workloads running in Kubernetes. 
It also aims to catch hard-to-test bugs and unacceptable behaviors before users do. Litmus strives to detect the 
real-world issues which escape during unit and integration tests.

While Litmus experiments were developed initially to test if a given stateful workload is suitable for running 
on [OpenEBS](www.openebs.io)(_a Kubernetes dynamic storage provisioner_); the use cases are broader and overall 
system resilience can be characterized before and during operations.  

## How Litmus is different from others
Litmus is an umbrella project that incorporates different pieces of a typical chaos engineering environment to deliver a 
complete solution to its users. Some of the core components include: 

- [Litmus](https://github.com/litmuschaos/litmus): The actual execution framework & repository of ready/configurable chaos 
  experiments (mostly written as ansible playbooks & executed as Kubernetes jobs). The jobs are often executed in CI pipelines 
  as part of e2e (refer https://openebs.ci) 

- [Chaos-Operator](https://github.com/litmuschaos/chaos-operator): A Kubernetes Operator that watches & acts on custom 
  resources defining litmus chaos experiment workflows. Typically used in deployment environments (dev/staging/pre-prod/prod) 
  where chaos experiments can be scheduled & monitored against specific applications. 

- [Chaos-Exporter](https://github.com/litmuschaos/chaos-exporter): A Prometheus Exporter that exposes chaos metrics based 
  on experiment results.

The chaos experiments make use of facilitator containers in [test-tools](https://github.com/litmuschaos/test-tools) to 
implement the chaos, load generation, logging and other utility functions. 

With Litmus, the test logic is packaged into dedicated containers which makes them portable across Kubernetes deployments. 
This containerization also helps to integrate Litmus into CI/CD environments. 

And as a developer friendly framework, it also provides helpful playbooks to quickly spin-up Kubernetes clusters on different 
cloud & on-premise platforms on which to run the experiments! 

For details on the architecture, implementation & reference usecases, please read the [litmus docs](https://docs.litmuschaos.io)

## Getting Started

Litmus experiment jobs(also called Litmusbooks) run using a dedicated ServiceAccount in the Litmus namespace. Setup RBAC via 
kubectl or helm, as shown below: 

- kubectl: 

  ```
  git clone https://github.com/openebs/litmus.git
  cd litmus
  kubectl apply -f hack/rbac.yaml
  kubectl apply -f hack/crds.yaml  
  ```

- helm: 

  ```
  helm repo add https://litmuschaos.github.io/chaos-charts
  helm install litmuschaos/litmusInfra --namespace=litmus
  ```

## Running an Experiment 

Let's say, you'd like to test resiliency of a stateful application pod upon container crash

- Locate the Experiment: Litmusbooks are typically placed in `experiments/<type>` folders. In this case, the corresponding
  litmusbook is present at `experiments/chaos/app_pod_failure` 

- Update the application (generally, the namespace and app labels) & chaos (if applicable) information passed as ENVs to 
  the litmus job (`run_litmus_test.yml`). 

- Run the litmusbook:

  ```
  kubectl create -f experiments/chaos/run_litmus_test.yml
  ```
   
## Get Experiment Results 

Results are maintained in a custom resource (`litmusresult`) that bears the same name as the experiment. In this case,
`application-pod-failure`. View the experiment status via:

```
kubectl describe lr application-pod-failure
```

## Viewing Logs 

Litmus pod (experiment-runner) console logs comprise of ansible playbbok run outputs & can be captured by any logging daemon
(such as fluentd), with most reference implementations using it as part of a standard stack (EFK). However, you could also use 
the stern-based [logger](https://github.com/litmuschaos/test-tools/tree/master/logger), either as a sidecar in the litmus job
or a separate deployment to collect pod & system (kubelet) logs.

## Ways to Contribute

Litmus is in *_alpha_* stage and needs all the help you can provide to have it cover the ever-growing Kubernetes landscape. 
Please contribute by raising issues, improving the documentation, contributing to the core framework and tooling, etc.

Another significant area of contribution is for you to describe your experiences/scenarios of running different kind of 
workloads (stateful & stateless) in your Kubernetes Environment.  For example, you can describe feature or failure (chaos) 
scenarios for a new workload or update the scenarios of existing workload. An example template is provided below: 

```
Feature: MySQL services are not affected due to node failures.
  I need to have at least 3 nodes in my Cluster.
  I need to have enabled Storage solution that supports accessing volume from different nodes.
  I need to have my MySQL running on a persistent volume.
  I need to have MySQL running even when 33% of volume nodes are unavailable.

  Scenario: Node hits an OutOfMemory condition and becomes unresponsive.
    Given I have a Kubernetes cluster with StorageClass installed.
    Given I have a “MySQL” service running and MySQL-client access it from a different node.
    Then I launch memory hog pod on the node where “MySQL” service is running,
    Then wait for "60s",
    And verify MySQL-client can still access data.
```

For more details on contributing, please refer to [CONTRIBUTING.md](./CONTRIBUTING.md)

## Reference Projects

Litmus makes use and extends several open source projects. Below are just some of the most commonly used projects.

- [ansible](https://www.ansible.com/)
- [chaoskube](https://github.com/linki/chaoskube)
- [pumba](https://github.com/alexei-led/pumba)
- [chaostoolkit](https://github.com/chaostoolkit/chaostoolkit)

For a full list, please checkout the [test-tools](https://github.com/litmuschaos/test-tools) repository.

## License

Litmus is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text. Some of the projects used by the Litmus project may be governed by a different license, please refer to its specific license.
