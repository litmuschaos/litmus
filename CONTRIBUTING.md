<img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4">

# Contributing to Litmus

---

Thanks for your interest in contributing to Litmus and help improve the project! ⚡️✨

## Where to Begin!

If you have any queries or requests about Litmus please [create an issue](https://github.com/litmuschaos/litmus/issues/new) on GitHub. If you want to comment or ask questions to the contributors start by [joining our community](http://slack.litmuschaos.io) and drop your questions in the **#litmus** channel.

If you want to do code contributions but you are fairly new to the tech stack we are using! Check out the [Local Development Guide](https://github.com/litmuschaos/litmus/wiki/ChaosCenter-Development-Guide) and [Development Best Practices](https://github.com/litmuschaos/litmus/wiki/Development-Best-Practices) to get a reference and help get started.

We welcome contributions of all kinds

- Development of features, bug fixes, and other improvements.
- Documentation including reference material and examples.
- Bug and feature reports.

---

## Steps to Contribute

Fixes and improvements can be directly addressed by sending a Pull Request on GitHub. Pull requests will be reviewed by one or more maintainers and merged when acceptable.

We ask that before contributing, please make the effort to coordinate with the maintainers of the project before submitting large or high impact PRs. This will prevent you from doing extra work that may or may not be merged.

Use your judgement about what constitutes a large change. If you aren't sure, send a message to the **#litmus-dev** slack or submit an issue on GitHub.

<br />

### **Sign your work with Developer Certificate of Origin**

To contribute to this project, you must agree to the Developer Certificate of Origin (DCO) for each commit you make. The DCO is a simple statement that you, as a contributor, have the legal right to make the contribution.

See the [DCO](https://developercertificate.org/) file for the full text of what you must agree to.

To successfully sign off your contribution you just add a line to every git commit message:

```git
Signed-off-by: Joe Smith <joe.smith@email.com>
```

Use your real name (sorry, no pseudonyms or anonymous contributions.)

If you set your `user.name` and `user.email` git configs, you can sign your commit automatically with `git commit -s`. You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with git ci and the commit will be signed.

<br />

### **Submitting a Pull Request**

To submit any kinds of improvements, please consider the following:

- Submit an [issue](https://github.com/litmuschaos/litmus/issues) describing your proposed change. If you are just looking to pick an open issue do so from a list of [good-first-issues](https://github.com/litmuschaos/litmus/labels/good%20first%20issue) maintained [here](https://github.com/litmuschaos/litmus/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).
- We would promptly respond back to your issue
- Fork this repository, develop and test your code changes. See the Highlighted Repositories section below to choose which area you would like to contribute to.
- Create a `feature branch` from your forked repository and submit a pull request against this repo’s main branch.
  - If you are making a change to the user interface (UI), include a screenshot of the UI changes.
- Follow the relevant coding style guidelines
  - For backend contributions, popular ones are the [Go Code Review Comments](https://code.google.com/p/go-wiki/wiki/CodeReviewComments) and the _Formatting_ and _style_ section of Peter Bourgon's [Go: Best Practices for Production Environments](https://peter.bourgon.org/go-in-production/#formatting-and-style).
  - If you are making any changes in backend, make sure you have run and tested the code locally, the reviewers might ask for relevant screenshots in the comments.
  - For frontend contributions, we follow the [Airbnb style guide](https://airbnb.io/javascript/react/)
- Your branch may be merged once all configured checks pass, including:
  - The branch has passed tests in CI.
  - A review from appropriate maintainers (see [MAINTAINERS.md](https://github.com/litmuschaos/litmus/blob/master/MAINTAINERS) and [GOVERNANCE.md](https://github.com/litmuschaos/litmus/blob/master/GOVERNANCE.md))

If you are new to Go, consider reading [Effective Go](https://golang.org/doc/effective_go.html) and [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments) for guidance on writing idiomatic Go code.

### Generating/Updating Mocks for `chaoscenter/graphql/server`

To generate new mocks or update existing mocks:

-   Follow the instructions to install [mockery](https://vektra.github.io/mockery/latest/installation/).
-   If generating mocks for existing interface simply run `mockery`.
-   If generating mocks for new interface update [`.mockery.yaml`](././chaoscenter/graphql/server/.mockery.yaml) and run `mockery`.

---

## Pull Request Checklist :

- Rebase to the current master branch before submitting your pull request.
- Commits should be as small as possible. Each commit should follow the checklist below:
  - For code changes, add tests relevant to the fixed bug or new feature
  - Pass the compile and tests in CI
  - Commit header (first line) should convey what changed
  - Commit body should include details such as why the changes are required and how the proposed changes
  - DCO Signed
- If your PR is not getting reviewed or you need a specific person to review it, please reach out to the Litmus contributors at the [Litmus slack channel](https://app.slack.com/client/T09NY5SBT/CNXNB0ZTN)

## Highlighted Repositories

You can choose from a list of sub-dependent repos to contribute to, a few highlighted repos that Litmus uses are:

- [Chaos-charts](https://github.com/litmuschaos/chaos-charts)
- [Chaos-workflows](https://github.com/litmuschaos/chaos-workflows)
- [Test-tools](https://github.com/litmuschaos/test-tools)
- [Litmus-go](https://github.com/litmuschaos/litmus-go)
- [Litmus-website](https://github.com/litmuschaos/litmus-website-2)
- [Litmusctl](https://github.com/litmuschaos/litmusctl)
- [Litmus-docs](https://github.com/litmuschaos/litmus-docs)
- [backstage-plugin](https://github.com/litmuschaos/backstage-plugin)

## Community

The litmus community will have a weekly contributor sync-up on Tuesdays 16.00-16.30 IST / 12.30-13.00 CEST

- The sync up meeting is held online on [Google Hangouts](https://meet.google.com/uvt-ozaw-bvp)
- The release items are tracked in the [release sheet](https://github.com/litmuschaos/litmus/releases).
