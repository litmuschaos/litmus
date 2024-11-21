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
-   Helm charts for LitmusChaos control plane  
-   Helm Chart for LitmusChaos execution Plane
-   Support for admin mode (centralized chaos management) as well as namespaced mode (multi-tenant clusters)
-   Continuous chaos via flexible schedules, with support to halt/resume or (manual/conditional) abort experiments
-   Provide complete workflow termination/abort capability 
-   Generation of observability data via Prometheus metrics and Kubernetes chaos events for experiments
-   Steady-State hypothesis validation before, during and after chaos injection via different probe types
-   Support for Docker, Containerd & CRI-O runtime
-   Support for scheduling policies (nodeSelector, tolerations) and resource definitions for chaos pods
-   ChaosHub refactor for 2.x user flow 
-   Support for ARM64 nodes
-   Minimized role permissions for Chaos Service Accounts
-   Scaffolding scripts (SDK) to help bootstrap a new chaos experiment in Go, Python, Ansible
-   Support orchestration of non-native chaos libraries via the BYOC (Bring-Your-Own-Chaos) model
-   Support for OpenShift platform 
-   Workflow YAML linter addition
-   Integration tests & e2e framework creation for control plane components and chaos experiments
-   Documentation (usage guide for chaos operator, resources & developer guide for new experiment creation)
-   Improved documentation and tutorials for Litmus Portal based execution flow 
-   Add architecture details & design resources 
-   Define community sync up cadence and structure  

------

### In-Progress (Under Design OR Active Development) 

- Native Chaos Workflows with redesigned subscriber to improve resource delegation, enabling seamless and efficient execution of chaos workflows within Kubernetes clusters.
- Introduce transient runners to improve resource efficiency during chaos experiments by dynamically creating and cleaning up chaos runner instances.
- Implement Kubernetes connectors to enable streamlined integration with Kubernetes clusters, providing simplified authentication and configuration management.
- Integrate with tools like K8sGPT to generate insightful reports that identify potential weaknesses in your Kubernetes environment before executing chaos experiments.
- Add Terraform support for defining and executing chaos experiments on infrastructure components, enabling infrastructure-as-code-based chaos engineering.
- Add SDK support for Python and Java, with potential extensions to other programming languages based on community interest.
- Include in-product documentation, such as tooltips, to improve user experience and ease of adoption.
- Implement the litmus-java-sdk with a targeted v1.0.0 release by Q1.
- Integrate distributed tracing by adding attributes or events to spans, and create an OpenTelemetry demo showcasing chaos engineering observability.
- Enhance the exporter to function as an OpenTelemetry collector, providing compatibility with existing observability pipelines.
- Add support for DocumentDB by replacing certain MongoDB operations, improving flexibility for database chaos.
- Upgrade Kubernetes SDK from version 1.21 to 1.26 to stay aligned with the latest Kubernetes features and enhancements.
- Refactor the chaos charts to:
  - Replace latest tags with specific, versioned image tags.
  - Consolidate multiple images into a single optimized image.
- Update GraphQL and authentication API documentation for improved clarity and user guidance.
- Add comprehensive unit and fuzz tests to enhance code reliability and robustness.
- Implement out-of-the-box Slack integration for better collaboration and monitoring during chaos experiments.

------

### Backlog 

-   Validation support for all ChaosEngine schema elements within workflow wizard 
-   Chaos-center users account to chaosService account map
-   Cross-hub experiment support within a Chaos Workflow 
-   Enhanced CRD schema for ChaosEngine to support advanced CommandProbe configuration
-   Support for S3 artifact sink (helps performance/benchmark runs)
-   Chaos experiments against virtual machines and cloud infrastructure (AWS, GCP, Azure, VMWare, Baremetal)
-   Off the shelf chaos-integrated monitoring dashboards for application chaos categories 
-   Support for user defined chaos experiment result definition 
-   Increased fault injection types (IOChaos, HTTPChaos, JVMChaos) 
-   Special Interest Groups (SIGs) around specific areas in the project to take the roadmap forward
