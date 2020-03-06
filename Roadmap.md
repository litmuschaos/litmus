## LITMUS ROADMAP

This document captures only a high level backlogs. For detailed list of backlogs, see [issues list](https://github.com/litmuschaos/litmus/issues) and [current milestones](https://github.com/litmuschaos/litmus/milestones). 

### Completed

- Declarative Chaos Intent via custom resources
- Chaos Operator to orchestrate chaos experiments
- Off the shelf / ready chaos experiments for general Kubernetes chaos
- Per-experiment minimal RBAC permissions definition
- Centralized Hub for chaos experiments
- Documentation (user & developer guides)
- Gitlab e2e pipeline for chaos experiments
- Define community sync up schedule 

------

### In-Progress (Near-term) 

- Support for scheduled (continuous/background) chaos with halt/resume 
- Support for Kubernetes events for chaos experiments
- Support for hard chaos abort via pre-stop hooks
- Support for admin mode (separate namespace for chaos resources, with opt-in/out option for specific experiments in applications)
- Helm3 charts for Litmus Chaos (operator, chaos charts)
- Scaffold tools to generate experiment templates in python, golang
- Support for user defined chaos experiment result definition (ex:json blob as chaos result)
- Pod level resource chaos libraries (memory, disk stress)
- HTTP proxy Chaos libraries
- Support for chaos on containerd runtime
- Self-sufficient ChaosHub with downloadable sample chaosengine, experiment-level RBAC manifests & versioned chaos charts
- Detailed Design docs 

------

### Backlog

- Support for Kubernetes pod scheduling policies (affinity rules for chaos resources)
- Support for cloudevents compliant chaos events
- Kubectl plugin for CLI based execution of chaos experiments
- Integration with Argo project for Chaos workflows, support for scenario creation with experiments
- Increased chaos metrics via prometheus chaos exporter
- Off the shelf chaos-integrated grafana dashboards for OpenEBS, Kafka, Cassandra
- CI (Gitlab) chaos templates
- Migration to native Kubernetes ansible modules for ansible-based experiments
- Improved application Chaos Suites (OpenEBS, Kafka, Cassandra) 