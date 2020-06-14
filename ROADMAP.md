## LITMUS ROADMAP

This document captures only the high level roadmap items. For the detailed backlog, see [issues list](https://github.com/litmuschaos/litmus/issues) and [current milestones](https://github.com/litmuschaos/litmus/milestones). 

### Completed

-   Declarative Chaos Intent via custom resources
-   Chaos Operator to orchestrate chaos experiments
-   Off the shelf / ready chaos experiments for general Kubernetes chaos
-   Per-experiment minimal RBAC permissions definition
-   Helm3 charts for Litmus Chaos (operator, kubernetes/generic chaos charts)
-   Support for Kubernetes events for chaos experiments
-   Support for admin mode (centralized chaos management) 
-   Centralized Hub for chaos experiments
-   Documentation (user & developer guides, integration with other chaos tools)
-   Gitlab e2e pipeline for chaos experiments
-   Define community sync up schedule 
-   Integration with Argo project for Chaos workflows, support for scenario creation with experiments
-   Support for scheduled (continuous/background) chaos  
-   Support for halt/resume capabilities with ChaosSchedule 

------

### In-Progress (Near-term) 

-   Off the shelf chaos-integrated grafana dashboards for OpenEBS, Kafka, Cassandra [#1280](https://github.com/litmuschaos/litmus/issues/1280)
-   Support for OpenShift platform/resources [1406](https://github.com/litmuschaos/litmus/issues/1406)
-   Support for complete chaos abort via pre-stop hooks [#1284](https://github.com/litmuschaos/litmus/issues/1284)
-   Go, Python SDK for Litmus Experiments [1466](https://github.com/litmuschaos/litmus/issues/1466) [#1259](https://github.com/litmuschaos/litmus/issues/1259)
-   Support for user defined chaos experiment result definition (ex:json blob as chaos result) [#1254](https://github.com/litmuschaos/litmus/issues/1254)
-   Pod level resource chaos libraries (disk stress)
-   HTTP proxy Chaos libraries [#1179](https://github.com/litmuschaos/litmus/issues/1179)
-   Support for chaos on containerd, CRIO runtimes [#1245](https://github.com/litmuschaos/litmus/issues/1245)
-   Self-sufficient ChaosHub with downloadable sample chaosengine, experiment-level RBAC manifests & versioned chaos charts [#1228](https://github.com/litmuschaos/litmus/issues/1228)
-   Support for custom override of chaos-operator, chaos-runner and chaos-experiment attributes [#1253](https://github.com/litmuschaos/litmus/issues/1253) [#1252](https://github.com/litmuschaos/litmus/issues/1252) [#1227](https://github.com/litmuschaos/litmus/issues/1227)
-   Detailed design [#1282](https://github.com/litmuschaos/litmus/issues/1282)

------

### Backlog

-   Support for Kubernetes pod scheduling policies (affinity rules for chaos resources)
-   Support for cloudevents compliant chaos events
-   Kubectl plugin for CLI based execution of chaos experiments
-   Increased chaos metrics via prometheus chaos exporter
-   CI (Gitlab) chaos templates
-   Migration to native Kubernetes ansible modules for ansible-based experiments
-   Improved application Chaos Suites (OpenEBS, Kafka, Cassandra) 
-   Support for platform (AWS, GKE, vSphere) Chaos  
