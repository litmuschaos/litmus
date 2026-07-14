## PokerBaazi

[PokerBaazi](https://www.pokerbaazi.com/) is India's biggest online poker platform providing an unparalleled world-class experience. Home Grown and 8 years of calling it our own, today, we have a strong and loyal user base of 40 LAC+ Indians.

### **Applications/Workloads or Infra that are being subjected to chaos by Litmus.**

At PokerBaazi, we leverage Litmus Chaos to subject critical components of our infrastructure to controlled chaos experiments. These include:

- Microservices Infrastructure: Our backend is designed as a microservices architecture, running on Kubernetes. We conduct experiments on inter-service communication, API latencies, and service resilience during node failures or resource constraints.
- Load Balancers and Networking: We simulate disruptions in networking, such as packet drops or DNS failures, to ensure our applications maintain connectivity and continue serving users.
- Application Workloads: High-demand applications like our gaming engine and payment/promotions api's are put under stress to evaluate their fault tolerance and recovery mechanisms during peak loads or unexpected outages.

### **Why do we use Litmus.**

We chose Litmus Chaos for several compelling reasons:

- Kubernetes-Native Integration: Since our infrastructure is heavily Kubernetes-based, Litmus seamlessly integrates with our stack, making it a natural fit.
- Ease of Use and Open-Source: Litmus offers a user-friendly interface along with robust documentation, allowing our teams to adopt it quickly without steep learning curves.
- Custom Experiment Support: The ability to create tailored chaos experiments aligned with our specific workloads ensures we can target critical failure scenarios unique to our ecosystem.
- Community Support and Scalability: Being an open-source project with an active community, Litmus evolves rapidly, allowing us to leverage the latest chaos engineering methodologies and tools.

Litmus has been instrumental in identifying hidden weaknesses in our system, such as unexpected dependencies or cascading failures. This has enabled us to proactively address potential issues, enhance system resilience, and meet our uptime commitments.

### **Where are we using Litmus.**

We use Litmus Chaos in various environments to ensure robust testing at every stage of development:

- Development: Initial chaos experiments are conducted in isolated dev environments to identify basic resilience issues and ensure service fault tolerance during early-stage development.
- Staging/Pre-Production: In staging, we run more comprehensive chaos scenarios simulating real-world failures, such as pod crashes, resource exhaustion, or external API downtime, to ensure the production-like environment is resilient.
- Production: Selected, low-risk chaos experiments are conducted in production under strict supervision to verify real-time system robustness and validate SLAs in live conditions.

Litmus Chaos has transformed our approach to building and maintaining a highly resilient gaming platform, allowing us to deliver exceptional user experiences while preparing for the unexpected.
