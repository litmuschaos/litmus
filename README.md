# Litmus
Litmus test your stateful application on Kubernetes without learning curves.  Empower end users to quickly specify needed scenarios using English descriptions. 
https://www.openebs.io/litmus

## Overview

[![Build Status](https://travis-ci.org/openebs/litmus.svg?branch=master)](https://travis-ci.org/openebs/litmus)

The primary objective of Litmus is to ensure a consistent and reliable behavior of workloads running in Kubernetes. It also aims to catch hard-to-test bugs and unacceptable behaviors before users do. Litmus strives to detect real-world issues which escape during unit and integration tests.

While Litmus tests and metrics were developed initially to test if a given Kubernetes deployment is suitable for running on OpenEBS (_a kubernetes dynamic storage provisioner_); the use cases are broader and overall system resilience can be characterized.

## How is Litmus different than others
Litmus keeps end user in mind while designing its test scenarios. Litmus accepts user story & converts it to respective test logic. In other words, Litmus translates each statement present in the user story into corresponding kubernetes command. This provides a transparent view to the users if any particular statement was executed successfully or resulted in failures.

In addition, each test logic is packaged as a dedicated container image making them highly portable across kubernetes deployments. This also helps verifying a feature by endusers after importing these containers in their CI/CD environments.

There are other aspects to Litmus which may be refered from:
- [litmus deep dive](docs/litmus_deep_dive.md)
- [running test suite](docs/running_test_suite.md)

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

