## **Halodoc**

[Halodoc](https://www.halodoc.com/) is a secure health-tech platform with a mission to simplifying access to healthcare by connecting millions of patients with licensed doctors, insurance, labs, and pharmacies in one simple mobile application. Halodoc’s innovative technology, nimble services, and patient focus enable a host of solutions including 24/7 doctor tele consultation via chat, voice or video; medicine purchase & delivery; lab services at home; and strong customer support.

Halodoc is the 2018 Forbes Indonesia Choice Award winner and Galen Growth’s 2018 Most Innovative HealthTech Startup in Asia, a testimony to a team of compassionate, innovative, trustworthy and agile people who take ownership of their work in building the most trusted digital healthcare company. 

### **Why we explored litmus**

We wanted a tool that we could leverage to test the resiliency of multi k8s cluster workloads in a private cloud, 
after evaluating different tools of similar flavour, we wanted to exercise our chaos experiments using Litmus, as it has the following benefits.

- It is designed for Kubernetes workload
- It has the wide range of chaos experiments to perform on k8s workload and Infrastructure
- It has litmus portal as control plane to target chaos experiments against multiple k8s cluster within our organisation.
- It has prometheus integration, able to see in litmus portal dashboard about how each of the workflow chaos experiments perform.
- It fits into our gitops flow to enable end to end automation.



### How we use litmus

At Halodoc we use Litmus to validate the resiliency of our private aws managed eks by covering the following areas.

- Testing resiliency of Control plane Kubernetes Infrastructure 
- Validating the HA of different control plane services
- Target SRE tools at k8s clusters, benchmark it based on several parameters.



### Benefits of litmus

Litmus has has a wide variety of chaos experiments for Kubernetes workload and Infrastructure and provides a very easy way for end-to-end automation of resiliency test cases.
