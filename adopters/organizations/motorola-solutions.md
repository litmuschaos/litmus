## Motorola Solutions

[Motorola Solutions](https://www.motorolasolutions.com/) is a global leader in public safety and enterprise security, providing mission-critical communications, software, video, and services that help keep people, businesses, and communities safer.

### **Applications/Workloads or Infra that are being subjected to chaos by Litmus.**

At Motorola Solutions, we leverage Litmus Chaos to subject critical components of our infrastructure to controlled chaos experiments. These include:

- Microservices Infrastructure: Our backend is designed as a microservices architecture, running on Kubernetes. We conduct experiments on inter-service communication, API latencies, and service resilience during node failures or resource constraints.
- Application Workloads: Running mission critical workloads smoothly, Litmus Chaos helps us figure out the gaps and to fill out the gaps.

### **Why do we use Litmus.**

We chose Litmus Chaos for several compelling reasons:

- Kubernetes-Native Integration: Since our infrastructure is heavily Kubernetes-based, Litmus seamlessly integrates with our stack, making it a natural fit.
- Ease of Use and Open-Source: Litmus offers a user-friendly interface along with robust documentation, allowing our teams to adopt it quickly without steep learning curves.
- Custom Experiment Support: The ability to create tailored chaos experiments aligned with our specific workloads ensures we can target critical failure scenarios unique to our ecosystem.
- Community Support and Scalability: Being an open-source project with an active community, Litmus evolves rapidly, allowing us to leverage the latest chaos engineering methodologies and tools.

### **Where are we using Litmus.**

We use Litmus Chaos in various environments (Dev, Stage, Prod, GovProd) to ensure robust testing at every stage of development.
