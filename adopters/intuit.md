## Intuit

[Intuit](https://intuit.com) is a product base company known for Quickbooks and TurboTax. We are contributing to open source, and few of our notable projects are Argo, Karate and Keiko. Our Group, The Intuit Modern SaaS Platform is a developer platform for automating development, build, deployment, scaling and management of containerized and serverless applications.It provides a simple and cohesive Developer Experience and abstracts infrastructure complexities by implementing Intuit specific security, compliance and network policies on top of open source Kubernetes(k8s) and AWS services.The goal of this platform is to provide automation at scale resulting in higher developer productivity and greatly increased velocity.


### **Why do we use litmus**

When we started building our next gen platfrom on kubernetes [Keiko](https://github.com/keikoproj), we realized reliability of that plaform is most important. We started using the litmus base solution. 

We do have our own home grown solution with container native approach, using [chaostoolki](https://chaostoolkit.org/). We need solution which can resuse the work and help in building kubernetes native way.

### **How do we use litmus**

We use litmus on cluster as operator, and create custome resources for experiments. Those experiment will be expose and executed via test using Argo workflow.  

In the future, we are planning to go gitOps for chaos. We have cluster and service owner use case to handle seperate role access to execute thes chaos.

We are using Chaos for Application, cloud and kubernetes platform. We are attaching chaos with Perfromance testing to get full impact of chaos on given service.

### **Benefits in using litmus**

We are getting benefits from its plug-in architecture. With open source and community backed up we could move fast if we face any challenges. I have shared our [journey on chaos ](https://medium.com/@sumitnagal/chaos-journey-279924051d57) and how we are using Choas Workflow and Chaos gitOps using [Argo](https://github.com/ArgoProj). 
