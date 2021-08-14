---
hide:
  - toc
---
# Install

## Table of Contents

1. [I encountered the concept of namespace and cluster scope during the installation. What is meant by the scopes, and how does it affect experiments to be performed outside or inside the litmus Namespace?](#i-encountered-the-concept-of-namespace-and-cluster-scope-during-the-installation-what-is-meant-by-the-scopes-and-how-does-it-affect-experiments-to-be-performed-outside-or-inside-the-litmus-namespace)

1. [Does Litmus 2.0 maintain backward compatibility with Kubernetes?](#does-litmus-20-maintain-backward-compatibility-with-kubernetes)

1. [Can I run LitmusChaos Outside of my Kubernetes clusters?](#can-i-run-litmuschaos-outside-of-my-kubernetes-clusters)

1. [What is the minimum system requirement to run Portal and agent together?](#what-is-the-minimum-system-requirement-to-run-portal-and-agent-together)

1. [Can I use LitmusChaos in Production?](#can-i-use-litmuschaos-in-production)

1. [Why should I use Litmus? What is its distinctive feature?](#why-should-i-use-litmus-what-is-its-distinctive-feature)

1. [What licensing model does Litmus use?](#what-licensing-model-does-litmus-use)

1. [What are the prerequisites to get started with Litmus?](#what-are-the-prerequisites-to-get-started-with-litmus)

1. [How to Install Litmus on the Kubernetes Cluster?](#how-to-install-litmus-on-the-kubernetes-cluster)

<hr/>

### I encountered the concept of namespace and cluster scope during the installation. What is meant by the scopes, and how does it affect experiments to be performed outside or inside the litmus Namespace?

The scope of portal control plane (portal) installation tuned by the env PORTAL_SCOPE of litmusportal-server deployment can be kept as a namespace if you want to provide very restricted access to litmus; It's useful in dev environments like Okteto cloud etc. That restricts portal installation along with its agent to a single namespace and the chaos operator, exporter all get installed in a single namespace and can only perform and monitor chaos in that namespace. Other than that there is another key in the control plane’s configmap litmus-portal-admin-config called AgentScope, this is given to allow users to restrict access to the litmus self-agent components self-agent is the agent for your control plane cluster (exporter, operator, etc), you can use both of them in a way to give access as per the requirement. The above holds for the control plane and self agent, for the external agents which can be connected using the litmusctl CLI you can provide the scope of the agent while using the utility to connect your other cluster to the control plane with access to just a single namespace or cluster-wide access. Using a combination of AgentScope: cluster and PORTAL_SCOPE env set to cluster would give you cluster-admin privileges to inject chaos on all namespaces where the control plane/portal is installed. For external agents just selecting the scope of installation as cluster would be sufficient via litmusctl.

### Does Litmus 2.0 maintain backward compatibility with Kubernetes?

Yes Litmus maintains a separate CRD manifest to support backward compatibility.

### Can I run LitmusChaos Outside of my Kubernetes clusters?

You can run the chaos experiments outside of the k8s cluster(as a container) which is dockerized. But other components such as chaos-operator,chaos-exporter, and runner are Kubernetes native. They require k8s cluster to run on it.

###  What is the minimum system requirement to run Portal and agent together?

To run LitmusPortal you need to have a minimum of 1 GiB memory and 1 core of CPU free.

### Can I use LitmusChaos in Production?

Yes, you can use Litmuschaos in production. Litmus has a wide variety of experiments and is designed as per the principles of chaos. But, if you are new to Chaos Engineering, we would recommend you to first try Litmus on your dev environment, and then after getting the confidence, you should use it in Production. 

### Why should I use Litmus? What is its distinctive feature?

Litmus is a toolset to do cloud-native Chaos Engineering. Litmus provides tools to orchestrate chaos on Kubernetes to help developers and SREs find weaknesses in their application deployments. Litmus can be used to run chaos experiments initially in the staging environment and eventually in production to find bugs, vulnerabilities. Fixing the weaknesses leads to increased resilience of the system. Litmus adopts a “Kubernetes-native” approach to define chaos intent in a declarative manner via custom resources.

### What licensing model does Litmus use?

Litmus is developed under Apache License 2.0 license at the project level. Some components of the projects are derived from the other Open Source projects and are distributed under their respective licenses.

### What are the prerequisites to get started with Litmus?

For getting started with Litmus the only prerequisites is to have Kubernetes 1.11+ cluster. While most pod/container level experiments are supported on any Kubernetes platform, some of the infrastructure chaos experiments are supported on specific platforms. To find the list of supported platforms for an experiment, view the "Platforms" section on the sidebar in the experiment page.

### How to Install Litmus on the Kubernetes Cluster?

You can install/deploy stable litmus using this command:

```
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-latest.yaml
```
