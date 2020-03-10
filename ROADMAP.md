## LITMUS ROADMAP

This document captures only a high level backlogs. For detailed list of backlogs, see [issues list](https://github.com/litmuschaos/litmus/issues) and [current milestones](https://github.com/litmuschaos/litmus/milestones). 

### Completed

-   Declarative Chaos Intent via custom resources
-   Chaos Operator to orchestrate chaos experiments
-   Off the shelf / ready chaos experiments for general Kubernetes chaos
-   Per-experiment minimal RBAC permissions definition
-   Centralized Hub for chaos experiments
-   Documentation (user & developer guides)
-   Gitlab e2e pipeline for chaos experiments
-   Define community sync up schedule 

------

### In-Progress (Near-term) 

-   Off the shelf chaos-integrated grafana dashboards for OpenEBS, Kafka, Cassandra [#1280](https://github.com/litmuschaos/litmus/issues/1280)
-   Support for scheduled (continuous/background) chaos with halt/resume [#1223](https://github.com/litmuschaos/litmus/issues/1223)
-   Support for Kubernetes events for chaos experiments [#1264](https://github.com/litmuschaos/litmus/issues/1244) [#1243](https://github.com/litmuschaos/litmus/issues/1243)
-   Support for hard chaos abort via pre-stop hooks [#1284](https://github.com/litmuschaos/litmus/issues/1284)
-   Support for admin mode (separate namespace for chaos resources, with opt-in/out option for specific experiments in applications) [#1219](https://github.com/litmuschaos/litmus/issues/1219)
-   Helm3 charts for Litmus Chaos (operator, chaos charts)[#1221](https://github.com/litmuschaos/litmus/issues/1221)
-   Scaffold tools to generate experiment templates in python, golang [#1259](https://github.com/litmuschaos/litmus/issues/1259)
-   Support for user defined chaos experiment result definition (ex:json blob as chaos result) [#1254](https://github.com/litmuschaos/litmus/issues/1254)
-   Pod level resource chaos libraries (memory, disk stress) [#877](https://github.com/litmuschaos/litmus/issues/877)
-   HTTP proxy Chaos libraries [#1179](https://github.com/litmuschaos/litmus/issues/1179)
-   Support for chaos on containerd runtime [#1245](https://github.com/litmuschaos/litmus/issues/1245)
-   Self-sufficient ChaosHub with downloadable sample chaosengine, experiment-level RBAC manifests & versioned chaos charts [#1228](https://github.com/litmuschaos/litmus/issues/1228)
-   Support for custom override of chaos-operator, chaos-runner and chaos-experiment attributes [#1253](https://github.com/litmuschaos/litmus/issues/1253) [#1252](https://github.com/litmuschaos/litmus/issues/1252) [#1227](https://github.com/litmuschaos/litmus/issues/1227)
-   Detailed design [#1282](https://github.com/litmuschaos/litmus/issues/1282), chaos integration docs [#1205](https://github.com/litmuschaos/litmus/issues/1205)  

------

### Backlog

-   Support for Kubernetes pod scheduling policies (affinity rules for chaos resources)
-   Support for cloudevents compliant chaos events
-   Kubectl plugin for CLI based execution of chaos experiments
-   Integration with Argo project for Chaos workflows, support for scenario creation with experiments
-   Increased chaos metrics via prometheus chaos exporter
-   CI (Gitlab) chaos templates
-   Migration to native Kubernetes ansible modules for ansible-based experiments
-   Improved application Chaos Suites (OpenEBS, Kafka, Cassandra) 
