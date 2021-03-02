## **Orange**

[Orange](https://www.orange.com/en/home) is a leading network operator for mobile, broadband internet, and fixed line telecommunications. It has its own new Infrastructure as a Service  solution designed to host different types of Workloads. 

### **Why we explored litmus**

We wanted a tool that we could leverage to test the containerized control plane of our private cloud, 
so we came across Litmus, it has the following benefits.

- It is designed for Kubernetes workload
- It has wide variety of generic test cases for Kubernetes workload and Infrastructure
- It can be used to trigger customized validations
- It is easy to Integrate with our existing automation framework



### How we explored litmus

We explored Litmus to validate the resiliency of our private telco cloud by covering the following areas.

- Testing resiliency of Control plane Kubernetes Infrastructure 
- Validating the HA of different control plane services
- Testing inter dependency among different open source applications



### Benefits of litmus

Litmus has has a wide variety of generic test cases for Kubernetes workload and Infrastructure and provides a very easy way for end-to-end automation of resiliency test cases.