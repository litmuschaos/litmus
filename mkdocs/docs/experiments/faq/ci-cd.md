---
hide:
  - toc
---
# CI/CD

## Table of Contents

1. [Is there any use case to integrate Litmus into CI? Which experiment have you integrated as part of the CI? And what would you do if a microservice fails an experiment in the CI?](#is-there-any-use-case-to-integrate-litmus-into-ci-which-experiment-have-you-integrated-as-part-of-the-ci-and-what-would-you-do-if-a-microservice-fails-an-experiment-in-the-ci)

1. [Is there any way to use Litmus within GitHub? When someone submits a k8s deployment for a PR , We want to run a chaos Experiment on that to see whether it passes or not](#is-there-any-way-to-use-litmus-within-github-when-someone-submits-a-k8s-deployment-for-a-pr-we-want-to-run-a-chaos-experiment-on-that-to-see-whether-it-passes-or-not)

1. [How can users integrate Litmuschaos in their environment with Gitops?](#how-can-users-integrate-litmuschaos-in-their-environment-with-gitops)

1. [How can we use Litmus in our DevOps pipeline/cycle?](#how-can-we-use-litmus-in-our-devops-pipelinecycle)

### Is there any use case to integrate Litmus into CI? Which experiment have you integrated as part of the CI? And what would you do if a microservice fails an experiment in the CI?

We have integrated Litmus with a couple of CI tools, the major ones are:

- GitHub Actions using `litmuschaos` actions
- GitLab using remote templates
- Keptn
- Spinnaker templates

By this, we induce chaos as part of the CI stage as Continuous Chaos allows us to automatically identify application failures over the development phase.

Failure of an exp in CI should invariably fail the pipeline. The pass would be more subjective. Depends on what is the nature of the CI pipeline - what it is the tests being carried is like etc., If you are doing a simple pod-delete or cpu-hog on a microservice pod w/o traffic OR w/o running it in an env that doesn't need it to interact w/ other services then the insights are limited.

### Is there any way to use Litmus within GitHub? When someone submits a k8s deployment for a PR , We want to run a chaos Experiment on that to see whether it passes or not.

Yes, with the help of GitHub-chaos-action we can automate the chaos execution on an application in the same place where the code is stored. We can write individual tasks along with chaos actions and combine them to create a custom GitHub workflow. GitHub Workflows are custom automated processes that we can set up in our repository to build, test, package, or deploy any code project on GitHub. Including the GitHub chaos actions in our workflow YAML, We can test the performance/resiliency of our application in a much simpler and better way. To know more visit our Github chaos action [repository](https://github.com/litmuschaos/github-chaos-actions).

### How can users integrate Litmuschaos in their environment with Gitops?

GitOps feature in Litmus enables users to sync workflows from a configured git repo, any workflow inserts/updates made to the repo will be monitored and picked up by the Litmus portal and will be executed on the target cluster. Litmus portal GitOps also includes an event-driven chaos injection feature where users can annotate an application to be watched for changes and if and when the change happens chaos workflows can be triggered automatically. This integrates with other GitOps tools like Flux/Argo CD and enables users to automatically run chaos workflows whenever a new release happens or a particular change occurs in the application. To configure a git repo the user must provide the Git URL of the repository and the branch name and the authentication credentials which are of two types:

  1. Access Token
  1. SSH Key

Once GitOps is enabled, any new workflows created will be stored in the configured repo in the path `litmus/<project-id>/<workflow-name>.yaml`

### How can we use Litmus in our DevOps pipeline/cycle?

You can add Litmus to the CI/CD pipelines as part of an end-to-end testing approach due to its minimal pre-requisites and simple result mechanisms. It also provides utilities for quick setup of Kubernetes clusters on different platforms as well as installation of storage provider control plane components (operators). [Openebs.ci](https://openebs.ci/home) is a reference implementation of how Litmus can be used in the DevOps pipeline.
