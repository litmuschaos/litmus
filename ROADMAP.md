## LITMUS ROADMAP

This document captures only the high level roadmap items. For the detailed backlog, see [issues list](https://github.com/litmuschaos/litmus/issues) and [current milestones](https://github.com/litmuschaos/litmus/milestones). 

### Completed

-   Declarative Chaos Intent via custom resources
-   Chaos Operator to orchestrate chaos experiments
-   Off the shelf / ready chaos experiments for general Kubernetes chaos 
-   Self sufficient, Centralized Hub for chaos experiments
-   Per-experiment minimal RBAC permissions definition
-   Helm3 charts for Litmus Chaos (operator, kubernetes/generic chaos charts)
-   Support for admin mode (centralized chaos management) as well as namespaced mode (multi-tenant clusters)
-   Generation of Kubernetes chaos events in experiments
-   Support for Docker, Containerd & CRI-O runtime
-   Scaffolding scripts (SDK) to help bootstrap a new chaos experiment in Go, Ansible
-   Continuous chaos via flexible scheduling policies, with support to halt/resume or abort experiments
-   Ability to customize/override experiment defaults on an instance basis
-   Support orchestration of non-native chaos libraries via the BYOC (Bring-Your-Own-Chaos) model
-   Define creation of scenarios involving multiple experiments via Argo-based Chaos Workflows
-   Support for OpenShift platform 
-   Gitlab e2e pipeline for chaos experiments
-   Documentation (user & developer guides, integration with other chaos tools)
- 	Add architecture details & design resources 
-   Define community sync up schedule  

------

### In-Progress (Near-term) 

-   Improved runtime validation of chaos dependencies via litmus admission controllers
-   Support for Kubernetes pod scheduling policies (affinity rules for chaos resources)
-   A UI portal for LitmusChaos to trigger and schedule chaos experiments & workflows. Ongoing development [here](https://github.com/litmuschaos/litmus/tree/master/litmus-portal/)
-   Off the shelf chaos-integrated grafana dashboards for OpenEBS, Kafka, Cassandra [#1280](https://github.com/litmuschaos/litmus/issues/1280)
-   Support for user defined chaos experiment result definition (ex:json blob as chaos result) [#1254](https://github.com/litmuschaos/litmus/issues/1254)
-   Increased IO-Chaos libraries [#1623](https://github.com/litmuschaos/litmus/issues/1623)
-   HTTP Chaos libraries [#1179](https://github.com/litmuschaos/litmus/issues/1179)
-   Create and functionalize Special Interest Groups (SIGs) around specific areas in the project to take the roadmap forward

------

### Backlog

-   Add pre-defined chaos workflows for the [podtato-head](https://github.com/cncf/podtato-head) model app from CNCF Ap-Delivery SIG 
-   Pre-defined chaos workflows to inject chaos during application benchmark runs 
-   Support for cloudevents compliant chaos events
-   Increased chaos metrics via prometheus chaos exporter
-   Migration to native Kubernetes ansible modules for ansible-based experiments
-   Improved application Chaos Suites (OpenEBS, Kafka, Cassandra) 
-   Support for platform (AWS, GKE, vSphere) Chaos  
