# Contributing to Litmus

![Litmus Logo](https://avatars0.githubusercontent.com/u/49853472?s=200&v=4)

Thanks for your interest in contributing to Litmus and help improve the project! ⚡️✨

We welcome contributions of all kinds:

- Development of features, bug fixes, and improvements  
- Documentation, tutorials, and examples  
- Reporting bugs or suggesting features  

>Before contributing, please read this guide to understand how to get started, submit code, and participate in the Litmus community.

## Getting Started

### Ask Questions or Discuss Ideas
- Join our community on [Slack](http://slack.litmuschaos.io) and post in **#litmus** for general questions or **#litmus-dev** for technical discussions.

### Report Issues or Propose Changes
- Open a new [GitHub issue](https://github.com/litmuschaos/litmus/issues/new) describing your request, bug, or feature idea.  
- Check the [good-first-issues](https://github.com/litmuschaos/litmus/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label for beginner-friendly contributions.

### Set Up Your Development Environment
- Follow the [Local Development Guide](https://github.com/litmuschaos/litmus/wiki/ChaosCenter-Development-Guide)  
- Review [Development Best Practices](https://github.com/litmuschaos/litmus/wiki/Development-Best-Practices)  
- For Go contributors, read [Effective Go](https://golang.org/doc/effective_go.html) and [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)  

You can contribute fixes and improvements by submitting a Pull Request (PR) on GitHub. Each PR will be reviewed by one or more maintainers and merged once it meets the project’s standards.

Before submitting large or high-impact PRs, we encourage you to coordinate with the project maintainers. This helps ensure your work aligns with the project’s goals and avoids unnecessary effort.

If you are unsure whether a change is considered large, reach out for guidance—either via the `#litmus-dev` Slack channel or by creating an issue on GitHub.

## Developer Certificate of Origin (DCO)

All contributions must be signed with the **Developer Certificate of Origin (DCO)**, confirming you have the legal right to submit your work.  

**Signing a commit manually:**  To successfully sign off your contribution you just add a line to every git commit message:
```git
Signed-off-by: Joe Smith <joe.smith@email.com>
```

**Automatic signing:**  
- Set git configs: `git config --global user.name` "Your Name" and `git config --global user.email` "your.email@example.com"  
- Use `git commit -s` to automatically sign commits  
- Optionally, create an alias: `git config --global alias.ci 'commit -s'`

>Note: Use your real name—no pseudonyms or anonymous commits.

For full details, see the [DCO documentation](https://developercertificate.org/).

## 3. Submitting a Pull Request (PR)

1. **Create an Issue (optional but recommended)**  
   Describe the problem or proposed feature on GitHub [issue](https://github.com/litmuschaos/litmus/issues). We would promptly respond back to your issue. 

2. **Fork the Repository**  
- Fork this repository, develop and test your code changes. See the Highlighted Repositories section below to choose which area you would like to contribute to.
- Create a `feature branch` from your forked repository and submit a pull request against this repo’s main branch.

3. **Develop & Test**  
- Follow backend and frontend coding guidelines:  
  - **Backend:** [Go Code Review Comments](https://code.google.com/p/go-wiki/wiki/CodeReviewComments), [Best Practices](https://peter.bourgon.org/go-in-production/#formatting-and-style)  
  - **Frontend:** [Airbnb React Style Guide](https://airbnb.io/javascript/react/)  

- If you are making any changes in backend, make sure you have run and tested the code locally, the reviewers might ask for relevant screenshots in the comments.
- Include relevant tests for new code or bug fixes  
- Include screenshots for UI changes  

4. **Push & Submit PR**  
- Ensure your branch is up-to-date with main  
- Submit a PR against the repository’s main branch  

5. **Review Process**  
- Your branch may be merged once all configured checks pass, including:
  - The branch has passed tests in CI.
  - A review from appropriate maintainers (see [MAINTAINERS.md](https://github.com/litmuschaos/litmus/blob/master/MAINTAINERS) and [GOVERNANCE.md](https://github.com/litmuschaos/litmus/blob/master/GOVERNANCE.md))
  - Merge occurs when all checks pass and reviews are approved  
  - If your PR is large or high-impact, coordinate with maintainers in **#litmus-dev** Slack

If you are new to Go, consider reading [Effective Go](https://golang.org/doc/effective_go.html) and [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments) for guidance on writing idiomatic Go code.

## Pull Request Checklist
- [ ] Rebase to the current master branch before submitting your pull request.
- [ ] Commits are small and clear. Each commit should follow the checklist below:
  - For code changes, add tests relevant to the fixed bug or new feature
  - Pass the compile and tests in CI
  - Commit header (first line) should convey what changed
  - Commit body should include details such as why the changes are required and how the proposed changes
  - DCO Signed
- [ ] Include screenshots for UI changes (if applicable)  

If your PR is not getting reviewed or you need a specific person to review it, please reach out to the Litmus contributors at the [Litmus slack channel](https://app.slack.com/client/T09NY5SBT/CNXNB0ZT)

## Generating/Updating Mocks (`chaoscenter/graphql/server`)

- Install mockery (https://vektra.github.io/mockery/latest/installation/)  
- For existing interfaces: run `mockery`  
- For new interfaces: update [`.mockery.yaml`](././chaoscenter/graphql/server/.mockery.yaml)` and run `mockery`  

## Highlighted Repositories

You can choose from a list of sub-dependent repos to contribute to, a few highlighted repos that Litmus uses are:

| Repository | Description |
|------------|-------------|
| [Chaos-charts](https://github.com/litmuschaos/chaos-charts) | Reusable chaos experiment charts |
| [Chaos-workflows](https://github.com/litmuschaos/chaos-workflows) | Automation workflows for chaos experiments |
| [Test-tools](https://github.com/litmuschaos/test-tools) | Testing utilities and tools |
| [Litmus-go](https://github.com/litmuschaos/litmus-go) | Core Go libraries for LitmusChaos |
| [Litmus-website](https://github.com/litmuschaos/litmus-website-2) | Project website and documentation |
| [Litmusctl](https://github.com/litmuschaos/litmusctl) | CLI for LitmusChaos |
| [Litmus-docs](https://github.com/litmuschaos/litmus-docs) | Documentation content |
| [Backstage-plugin](https://github.com/litmuschaos/backstage-plugin) | Backstage plugin for Litmus |


## Community & Meetings

The litmus community will have a weekly contributor sync-up on Tuesdays 16.00-16.30 IST / 12.30-13.00 CEST

- The sync up meeting is held online on [Google Hangouts](https://meet.google.com/uvt-ozaw-bvp)
- The release items are tracked in the [release sheet](https://github.com/litmuschaos/litmus/releases).

If you cannot attend, participate asynchronously via Slack or GitHub discussions.