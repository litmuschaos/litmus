## LITMUS ROADMAP

This document captures only the high level roadmap items. For the detailed backlog, see [issues list](https://github.com/litmuschaos/litmus/issues). 

### Completed

-   Declarative Chaos Intent via custom resources
-   Chaos Operator to orchestrate chaos experiments
-   Off the shelf / ready chaos experiments for general Kubernetes chaos 
-   Self sufficient, Centralized Hub for chaos experiments
-   Per-experiment minimal RBAC permissions definition
-   Creation of 'scenarios' involving multiple faults via Argo-based Chaos Workflows (with examples for microservices apps like podtato-head and sock-shop)
-   Cross-Cloud Control Plane (Litmus Portal) to perform chaos against remote clusters
-   Helm3 charts for LitmusChaos (control plane and experiments) 
-   Support for admin mode (centralized chaos management) as well as namespaced mode (multi-tenant clusters)
-   Continuous chaos via flexible schedules, with support to halt/resume or (manual/conditional) abort experiments
-   Generation of observability data via Prometheus metrics and Kubernetes chaos events for experiments
-   Steady-State hypothesis validation before, during and after chaos injection via different probe types
-   Support for Docker, Containerd & CRI-O runtime
-   Support for scheduling policies (nodeSelector, tolerations) and resource definitions for chaos pods
-   Support for ARM64 nodes
-   Scaffolding scripts (SDK) to help bootstrap a new chaos experiment in Go, Python, Ansible
-   Support orchestration of non-native chaos libraries via the BYOC (Bring-Your-Own-Chaos) model
-   Support for OpenShift platform 
-   Integration tests & e2e framework creation for control plane components and chaos experiments
-   Documentation (usage guide for chaos operator, resources & developer guide for new experiment creation)
-   Add architecture details & design resources 
-   Define community sync up cadence and structure  

------

### In-Progress (Under Active Development) 

-   Support for all ChaosEngine schema elements within workflow wizard 
-   Workflow YAML linter addition
-   Minimized role permissions for Chaos Service Accounts
-   Chaos-center users account to chaosService account map
-   Provide complete workflow termination/abort capability 
-   Cross-hub experiment support within a Chaos Workflow 
-   Helm Chart for Chaos Execution Plane
-   Enhanced CRD schema for ChaosEngine to support advanced CommandProbe configuration
-   Support for S3 artifact sink (helps performance/benchmark runs)
-   ChaosHub refactor for 2.x user flow 
-   Chaos experiments against virtual machines and cloud infrastructure (AWS, GCP, Azure, VMWare, Baremetal)
-   Improved documentation and tutorials for Litmus Portal based execution flow 
-   Off the shelf chaos-integrated monitoring dashboards for application chaos categories 
-   Support for user defined chaos experiment result definition 
-   Increased fault injection types (IOChaos, HTTPChaos, JVMChaos) 
-   Special Interest Groups (SIGs) around specific areas in the project to take the roadmap forward

------

### Backlog 

-   Pre-defined chaos workflows to inject chaos during application benchmark runs 
-   Support for cloudevents compliant chaos events
-   Improved application Chaos Suites for various CNCF projects 
