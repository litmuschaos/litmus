## AppAnywhere

AppAnywhere is an industry-leading managed service from Wipro for customers adopting containers. It addresses the operational and security encounters of multiple Kubernetes clusters and provides managed services for monitoring, logging, and observability of multiple Kubernetes clusters. AppAnywhere is a managed service comprising a set of tightly integrated technologies to deliver end-to-end automation of container-based IT lifecycle to enterprises

### Why do we use litmus

We do use Litmus to validate and verify the reliability of applications moved into Kubernetes as part of end-to-end automation. The practice of chaos engineering says we have to induce failures into apps in production to detect anomalies. Litmus helps the same.

### How do we use litmus

We have included Litmus as part of AppAnyhere Gecko where our customers can run Chaos on their applications and themselves validate the resiliency of their application in the Kubernetes environment. This would help them to capture abnormalities and harden their platform. 

### Benefits in using litmus

After incorporating the Litmus in our platform we are able to harden the applications and catch the resiliency issues early. The community is growing and they are able to add new Application specific chaos by the application experts which we believe a scalable model to develop more perfect chaos with respect to the application.

