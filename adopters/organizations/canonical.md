# Canonical
[Canonical](https://canonical.com) is the company behind Ubuntu, the world's most popular Linux distribution for cloud and Kubernetes workloads. We publish and maintain open-source infrastructure across the cloud-native ecosystem.

## Applications/Workloads or Infra that are being subjected to chaos by Litmus

We are building a suite of [Juju](https://juju.is/) charmed operators that deploy and manage the entire LitmusChaos control plane on Kubernetes — auth server, backend API, ChaosCenter frontend, and execution-plane infrastructure provisioner. The goal is to make Litmus a first-class citizen of the Juju-driven ecosystem of charmed operators, so that teams already managing databases, observability stacks, and application workloads with Juju can add chaos engineering to the same declarative model.

The workloads under chaos are Kubernetes-native services deployed and operated through Juju charms (e.g. MongoDB, PostgreSQL, Kafka, application charms), where Litmus experiments validate the resilience guarantees these operators promise.


## Why was Litmus chosen & how it is helping you

- Litmus's CRD-based approach fits naturally alongside Juju's own Kubernetes operator model.
- the built-in fault catalogue covers the failure modes that matter most when validating charmed operator lifecycle (pod kill, network partition, disk stress, node drain).
- being CNCF-incubating and fully open source aligns with Canonical's commitment to open-source infrastructure.
- the gRPC + HTTP API surface makes it straightforward to drive Litmus from charm code.

Litmus is helping us prove that charmed operators handle Day-2 disruptions gracefully — leader failover, rolling upgrades under fault injection, and automatic recovery after infrastructure failures.

## How we use Litmus

We automate operations on the full Litmus stack via four charmed operators published on [Charmhub](https://charmhub.io/):

- [**litmus-auth-k8s**](https://charmhub.io/litmus-auth-k8s) — authentication & authorisation server
- [**litmus-backend-k8s**](https://charmhub.io/litmus-backend-k8s) — ChaosCenter backend API & workflow orchestration
- [**litmus-chaoscenter-k8s**](https://charmhub.io/litmus-chaoscenter-k8s) — web UI frontend (nginx-based)
- [**litmus-infrastructure-k8s**](https://charmhub.io/litmus-infrastructure-k8s) — execution-plane infrastructure provisioner

See [chaos-engineering](https://canonical-chaos-engineering.readthedocs-hosted.com/en/latest/) for the full solution documentation.

Each charm integrates with the broader Juju ecosystem through standard interfaces: MongoDB for persistence, TLS certificates for mTLS, Prometheus/Loki/Tempo for observability, and Traefik for ingress. 

We aim to use this internally in our CI/CD and staging environments to chaos-test charmed operators and QA our internal deployments.

