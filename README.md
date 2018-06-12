# Litmus
Litmus is chaos engineering for stateful workloads on Kubernetes -> hopefully without learning curves.  Our vision includes  enabling end users to quickly specify needed scenarios using English descriptions. 
https://www.openebs.io/litmus

## Overview

[![Build Status](https://travis-ci.org/openebs/litmus.svg?branch=master)](https://travis-ci.org/openebs/litmus)

The primary objective of Litmus is to ensure a consistent and reliable behavior of workloads running in Kubernetes. It also aims to catch hard-to-test bugs and unacceptable behaviors before users do. Litmus strives to detect real-world issues which escape during unit and integration tests.

While Litmus tests and metrics were developed initially to test if a given Kubernetes deployment is suitable for running on OpenEBS (_a kubernetes dynamic storage provisioner_); the use cases are broader and overall system resilience can be characterized before and during operations.  To learn more about OpenEBS please visit: www.openEBS.io

## How is Litmus different than others
Litmus is an overall project that incorporates pieces of a typical chaos engineering environment to deliver a more complete solution to Litmus users. 

Also, Litmus incorporates some innovations in translating end user user stories directly into scenarios. Litmus accepts user stories in simple English text & converts them to logic.  Litmus translates each statement present in a user story into corresponding Kubernetes commands. This provides a transparent view to the users if any particular statement was executed successfully or resulted in failures.

Additionally, test logic is packaged as dedicated containers which of course makes them portable across Kubernetes deployments. This containerization also helps to integrate these containers into CI/CD environments.

There are other aspects to Litmus which are discussed:
- [litmus deep dive](docs/litmus_deep_dive.md)
- [running test suite](docs/running_test_suite.md)

# Running a specific Test

Users have a Kubernetes environment with a given stateful workload and underlying storage and would like to test a specific scenarion:

- Ensure that the desired storage operators are actually available on a given Kubernetes cluster.

- Clone the Litmus repo and setup a dedicated RBAC for Litmus.

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
  - Verifies that the StorageClass mentioned (default: OpenEBS) is loaded in the cluster
  - Launches mysql application with storage
  - Runs a sample TPC-C benchmark against mysql application
  - Provides the benchmark results
  - Reverts system state/performs clean-up by removing deployments launched during the test

As the test ends, the logs of the various storage pods, including the test results of this Kubernetes job are 
collected and saved in a temporary location. The `run_litmus_test.yaml` can be customized for the location for 
saving the logs, type of storage (StorageClass) to be used, etc..  This type of deployment test can be used to accelerate the feedback loop when deploying new pieces of a stack, whether underlying cloud or hardware, network, storage, or other.

## Ways to Contribute

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

