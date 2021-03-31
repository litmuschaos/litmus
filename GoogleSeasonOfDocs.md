# GSoD @LitmusChaos

## Introduction

Hello All! This doc contains the "project proposal" for LitmusChaos's participation in the 2021 [Google Season of Docs](https://developers.google.com/season-of-docs). We look forward to a productive and fun experience working with the technical writers that come on board! 

## About LitmusChaos

Litmus is a Cloud-Native Chaos Engineering platform that helps SREs & Developers identify and fix weaknesses in their system. It is a CNCF
Sandbox project with adoption across several organizations. Litmus has a thriving community that lives in [Kubernetes Slack](https://kubernetes.slack.com/?redir=%2Farchives%2FCNXNB0ZTN). You can find out more about Litmus and it's evolution from the [blog](https://dev.to/t/litmuschaos) or [videos](https://www.youtube.com/playlist?list=PLmM1fgu30seVGFyNIEyDgAq6KnzgW2p3m). 

## State of LitmusChaos Documentation 

The steps for getting started with Litmus & procedure for running individual chaos experiments are available in the [Docs Website](https://docs.litmuschaos.io). The Litmus architecture is available in the [Wiki](https://github.com/litmuschaos/litmus/wiki/Litmus-Architecture), with contribution docs
spread across the different sub-projects/repositories contained within the [LitmusChaos](https://github.com/litmuschaos) GitHub organization. This includes
guides detailing how developers can contribute to the [Chaos Experiment suite](https://github.com/litmuschaos/litmus-go/tree/master/contribute/developer-guide) and the [documentation](https://github.com/litmuschaos/litmus-docs/blob/master/CONTRIBUTING.md) itself. 

Like minded folks from the community interested in improving documentation have formed a special interest group (SIG-Docs), that meets at every Monday @8PM IST on the community [zoom meet](https://zoom.us/j/91358162694). 

Litmus is undergoing a major version change (to 2.0. Currently in beta). The community plans to move to Docusaurus-2 as the platform of choice for hosting the documentation. 

## Project Idea: Create Tutorials for Litmus 2.0 

### Problems

- The current docs are helpful for intermediate-level chaos-practitioners. We still lack enough simple, easy-to-navigate guides that help beginners 
or support quick evaluation. 
- Litmus 2.0 offers a newer approach to chaos experimentation compared to the 1.x releases. It uses a portal/dashboard driven approach that allows for 
several user flows. These are still not documented. 
- Litmus integrates with a wide-variety of tools/frameworks in the CNCF ecosystem - monitoring tools, CI/CD systems etc., which are not documented fully

### Scope of Work

One of the solutions mooted by the community and maintainers team is to create an initial set of "tutorials" based on [GoogleCodeLabs](https://github.com/googlecodelabs/tools) for a list of common user flows - that include usage of the litmus portal (2.0) & integration with other cloud native tools. These tutorials will be featured on the LitmusChaos project/docs website. 

While the existing documentation framework (and upcoming one based on docusaurus-2) is expected to contain architecture, experiment and other conceptual 
details that will help intermediate-level/advanced chaos practitioners build out their usecases, the tutorials are expected to be what the users will most 
benefit from to get started and familiarize themselves with Litmus. 

The GSoD collaborator is expected to work on tutorials in the following areas and publish them, while setting up the source artifacts for further scale 
and easy contributions from the community. 

- How to Get Started: Installation of Litmus via Helm, Portal Set-up, Execution of a Simple Chaos Worflow on a local/remote Target
- How to Construct Custom Chaos Workflows (Using Portal, LitmusCtl)
- How to create teams & manage users
- How to enable GitOps driven Chaos Workflow Management and Execution
- How to Visualize Chaos Using Chaos-Interleaved Application Dashboards
- How to setup Automated Hypothesis Validation using Litmus Probes
- How to use Resilience Grading & Chaos Analytics
- How to Integrate with Gitlab, GitHubActions, Spinnaker, Keptn

### How would we measure success

- Decrease in the number of basic usage related questions on the slack community
- Decrease in the number of GitHub issues related to queries/missing information
- Better SEO for LitmusChaos related concepts 
- Increase in non-code/docs contributors to enhance the tutorials (improvements to existing ones or contribute new ones)

### Skills Needed

- The participant is expected to be comfortable in following steps/docs provided by the Litmus developers, following instructions to test them 
for correctness & re-write in the tutorial format. This involves basic Git usage, setting up a local development environment for docs and using
a Kubernetes cluster (the instructions and assistance for last requirement will be provided by a volunteer team from the community)

### Budget Details

|Budget Item|Amount(in USD)|Running Total| Notes |
------------|------|-------------|-------|
|Tutorials Creation for Litmus 2.0| 6000.00 | 6000.00 |  |
|Volunteer Stipends | 500 | 8000.00 | 4 volunteer stipends x 500 each |
|**Total** | | 8000.00 | | 

### Mentors Team 

You can reach out to following folks from the LitmusChaos community for queries &  assistance

- karthik@chaosnative.com (@ksatchit)
- raj@chaosnative.com (@rajdas98)
- tankjaye@amazon.com (@k8s-dev)
- divya.mohan0209@gmail.com (@divya-mohan0209)

### Contact Info

Technical Writers interested in this project can reach out by sending an email to the following folks. Please include links to your technical writing
work or portfolio/CV

- uma@chaosnative.com
- ajesh@chaosnative.com
- karthik@chaosnative.com

