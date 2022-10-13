## Adidas
[Adidas](https://adidas.com) is a German multinational corporation, founded and headquartered in Herzogenaurach, Bavaria, that designs and manufactures shoes, clothing and accessories. 


## Why do we use Litmus.  

In adidas, we started months ago with a new initiative about how to implement chaos engineering practices in order to provide the engineering teams a guide and tools about how to test the resilience of the applications through chaos engineering. With this goal in mind, we started to define some best practices and processes to be shared with our engineering team, and we started to evaluate a few tools.

After an evaluation of different tools, we decided to go ahead with Litmus Chaos.

## How are we using Litmus chaos:
Applications/Workloads or Infra that are being subjected to chaos by Litmus

- Litmus chaos will be provided by our platform team as part of their services. It will be running on kubernetes and will be available for engineering teams.
- Experiments, like pod deletion, network latency or packetloss, applied between functional dependencies like checkout & Payments, login, order creation...
- Not applied in production yet.

## Why was Litmus chosen & How it is helping you 
We defined a set of priorities (with different value) and stoppers, we analyzed the tooling and selected the most valued one:

- Prio 1 & Stoppers if not: Full detailed documentation in English available, API / Shared Libraries, Control Injecting Failure, Permissions scope isolated, Authorization, chaos Scenarios - Parallel, works with: Kuberentes, OpenSource
- Prio 2: Installation and Management, Metrics / Reporting, Halt attack, Automatic rollback, High/admin permissions on the node, Chaos scenarios as code, chaos attacks - Serial, Custom or Specialized Attacks, Custom or Specialized Scenarios, Works with: AWS
- Prio 3: Access to the logs, Scheduling attacks, Health Checks, Application Attacks, Target Randomization, Network Attacks, VMs Attacks, Public API, Web UI

## How do we use Litmus
- Staging/pre-prod
- Planned to go to production and through CI/CD pipelines.
If you would like your name (as standalone user) or organization name to be added to the Adopters.md, please provide a preferred contact handle like GitHub id, Twitter id, LinkedIn id, website etc.

