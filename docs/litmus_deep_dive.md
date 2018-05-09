# Litmus Deep Dive

Litmus tests range from initial setup and configuration validation to deploying and running workloads under various conditions and failures. 

Litmus comprises the following major components:
- **Deployments** that help in setting up different types of Kubernetes Clusters like on-premise, cloud, OpenShift, etc. The default is that the deployment scripts to provision and configure OpenEBS storage, however, these deployments are easily extended to support other storage. 
- **Framework** for test execution that includes: 
  * Defining and running test suites 
  * Capturing logs and generating reports about the test runs
  * Fault/Error injection tools that help to perform chaos tests
  * Examples that demonstrate how to integrate these test pipelines with Slack notifications
- **Test modules** that can be triggered from within a Kubernetes cluster. Think of these a containerized tests. For instance, the **_mysql-client_** can be launched as a pod to validate the MySQL resiliency while the underlying nodes and the connected storage are subjected to chaos engineering.
- **Tests** that themselves are written in easy to understand formats, either in plain English (thanks Godog!) or in Ansible Playbooks. These tests primarily interact with the Kubernetes cluster via **_kubectl_** making them highly portable.

Litmus can be used to test a given workload in a variety of Kubernetes environments, for example, a developer minikube or a GKE cluster with a specific storage solution or as a part of a full-fledged CI setup.
