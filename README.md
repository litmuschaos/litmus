# Overview

[![Build Status](https://travis-ci.org/openebs/litmus.svg?branch=master)](https://travis-ci.org/openebs/litmus)

The primary objective of Litmus is to ensure a consistent and reliable behavior of Kubernetes for various persistent workloads and to catch hard-to-test bugs and unacceptable behaviors before users do.  Litmus can detect many more real-world issues than relatively simple issues identified by unit and integration tests. 

Litmus can also be used to determine if a given Kubernetes deployment is suitable for stateful workloads.  While Litmus tests and metrics were developed initially to test the resilience of container attached storage from OpenEBS and others - the use cases are broader and overall system resilience can be characterized.  

Litmus tests range from initial setup and configuration validation to deploying and running persistent workloads under various conditions and failures. Litmus comprises the following major components:
- **Deployments** that help in setting up different types of Kubernetes Clusters like on-premise, cloud, OpenShift, etc. The default is that the deployment scripts to provision and configure OpenEBS storage, however, these deployments are easily extended to support other storage. 
- **Framework** for test execution that includes: 
  * Defining and running test suites 
  * Capturing logs and generating reports about the test runs
  * Fault/Error injection tools that help to perform chaos tests
  * Examples that demonstrate how to integrate these test pipelines with Slack notifications
- **Test modules** that can be triggered from within a Kubernetes cluster. Think of these a containerized tests. For instance, the **_mysql-client_** can be launched as a pod to validate the MySQL resiliency while the underlying nodes and the connected storage are subjected to chaos engineering.
- **Tests** that themselves are written in easy to understand formats, either in plain English (thanks Godog!) or in Ansible Playbooks. These tests primarily interact with the Kubernetes cluster via **_kubectl_** making them highly portable.

Litmus can be used to test a given workload in a variety of Kubernetes environments, for example, a developer minikube or a GKE cluster with a specific storage solution or as a part of a full-fledged CI setup.

# Running a specific Test

Users have a Kubernetes environment with a given storage solution and would like to test a specific scenario.

- Ensure that the storage operators, if any, have been setup on the Kubernetes cluster.

- Clone the Litmus repo and setup a dedicated rbac for Litmus.

```
git clone https://github.com/openebs/litmus.git
cd litmus
kubectl apply -f hack/rbac.yaml 
```

- The tests are categorized based on application workloads, with different aspects/use-cases of the application 
constituting a separate test. Select a workload and follow the instructions under the corresponding 
`<workload>/<usecase>/README`.

  For example, to run a MySQL benchmarking test:

```
cd tests/mysql/mysql_storage_benchmark/
<Modify the PROVIDER_STORAGE_CLASS in run_litmus_test.yaml>
kubectl apply -f run_litmus_test.yaml
```

  The above test runs a Kubernetes job that:
  - Verifies that the StorageClass mentioned (default: openebs) is loaded in the cluster
  - Launches mysql application with storage
  - Runs a sample TPC-C benchmark against mysql application
  - Provides the benchmark results
  - Reverts system state/performs clean-up by removing deployments launched during the test

As the test ends, the logs of the various storage pods, including the test results of this Kubernetes job are 
collected and saved in a temporary location. The `run_litmus_test.yaml` can be customized for the location for 
saving the logs, type of storage (StorageClass) to be used, etc..,

# Running a Complete Test Suite

The Litmus test suite can be run on a kubernetes cluster using an ansible-based executor framework. 
This involves: 

- Setting up ansible on any linux machine (ansible test harness), with SSH access to the kubernetes cluster 
- Generating the ansible inventory file with host information (master/control node & hosts)
- Modifying a global variables file to:
   
  - Set Provider and storage class
  - Select test Category (call or subset)
  - Enable/Disable some services like log collection, notifications etc..,

Follow the executor/README for detailed instructions on how to perform above steps. Once these pre-requisites 
have been met, execute the following on the ansible test harness:

```
./litmus/executor/ansible/run-litmus.sh
```

The above script will verify that it has all the details required for it to proceed and provides you with 
test task execution status. 

*Litmus may take a while to show a reaction as it puts the system through rigorous scrutiny!*

# Contributing

Litmus is in *_alpha_* stage and needs all the help you can provide to have it cover the ever-growing Kubernetes landscape. Please contribute by raising issues, improving the documentation, contributing to the core framework and tooling, etc. 

Another significant area of contribution is for you to describe your experiences/scenarios of running Stateful workloads in your Kubernetes Environment.  For example, you can describe feature or scenarios for a new workload or update the scenarios of existing workload as follows:

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

# Reference Projects

Litmus makes use and extends several open source projects. Below are just some of the most commonly used projects. 

- https://github.com/DATA-DOG/godog
- https://www.ansible.com/
- https://github.com/linki/chaoskube
- https://github.com/alexei-led/pumba
- https://github.com/wercker/stern

For a full list, please checkout the [./tools](./tools) directory.

# License

Litmus is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text. Some of the projects used by the Litmus project may be governed by a different license, please refer to its specific license. 

