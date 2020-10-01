## Intuit

[Intuit](https://intuit.com) is a product company known for Quickbooks and TurboTax. We contribute to open source, and a few of our notable projects are Argo, Karate, and Keiko. Our Group, The Intuit Modern SaaS Platform, is a developer platform for automating development, building, deployment, scaling, and managing containerized and serverless applications. It provides a cohesive and straightforward Developer Experience and abstracts infrastructure complexities by implementing Intuit specific security, compliance, and network policies on top of open-source Kubernetes(k8s) and AWS services. This platform aims to provide automation at scale, resulting in higher developer productivity and significantly increased velocity.


### **Why do we use litmus**

When we started building our next-gen platform on kubernetes [Keiko](https://github.com/keikoproj), we realized that its reliability is most important. We started using the litmus base solution. 

We have our homegrown solution build on kubernetes with a container-native approach, using [chaostoolkit](https://chaostoolkit.org/). We need a solution that can reuse the work and help in building kubernetes native way.

### **How do we use litmus**

We use litmuschaos on the cluster as an operator and create custom resources for experiments. Those experiments will be exposed and executed via the test using Argo workflow.  

In the future, we are planning to go gitOps for chaos. We have a cluster and service owner use case to handle separate role access to execute this chaos.

We are using Chaos for Application, cloud, and kubernetes platform. We are attaching chaos with Performance testing to get the full impact of chaos on the given service.

### **Benefits in using litmus**

We are getting benefits from its plug-in architecture. With open-source and community-backed up, we could move fast if we face any challenges. I have shared our [journey on chaos ](https://medium.com/@sumitnagal/chaos-journey-279924051d57) and how we are using Choas Workflow and Chaos gitOps using [Argo](https://github.com/ArgoProj).
