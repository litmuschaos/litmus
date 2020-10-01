<img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4">

# Contributing to Litmus :

Litmus is an Apache 2.0 Licensed project and uses the standard GitHub pull requests process to review and accept contributions.

There are several areas of Litmus that could use your help. For starters, you could help in improving the sections in this document by either creating a new issue describing the improvement or submitting a pull request to this repository. 

* If you are a first-time contributor, please see [Steps to Contribute](#steps-to-contribute).
* If you would like to suggest new tests to be added to litmus, please go ahead and [create a new issue](https://github.com/litmuschaos/litmus/issues/new) describing your test. All you need to do is specify the workload type and the operations that you would like to perform on the workload.
* If you would like to work on something more involved, please connect with the Litmus Contributors. 
* If you would like to make code contributions, all your commits should be signed with Developer Certificate of Origin. See [Sign your work](#sign-your-work). 

## Steps to Contribute :

* Find an issue to work on or create a new issue. The issues are maintained at [litmuschaos/litmus](https://github.com/litmuschaos/litmus/issues). You can pick up from a list of [good-first-issues](https://github.com/litmuschaos/litmus/labels/good%20first%20issue).
* Claim your issue by commenting your intent to work on it to avoid duplication of efforts. 
* Fork the repository on GitHub.
* Create a branch from where you want to base your work (usually master).
* Make your changes.
* Relevant coding style guidelines are the [Go Code Review Comments](https://code.google.com/p/go-wiki/wiki/CodeReviewComments) and the _Formatting and style_ section of Peter Bourgon's [Go: Best Practices for Production Environments](https://peter.bourgon.org/go-in-production/#formatting-and-style).
* Commit your changes by making sure the commit messages convey the need and notes about the commit.
* Push your changes to the branch in your fork of the repository.
* Submit a pull request to the original repository. See [Pull Request checklist](#pull-request-checklist)


## Pull Request Checklist :
* Rebase to the current master branch before submitting your pull request.
* Commits should be as small as possible. Each commit should follow the checklist below:

  - For code changes, add tests relevant to the fixed bug or new feature
  - Pass the compile and tests - includes spell checks, formatting, etc
  - Commit header (first line) should convey what changed
  - Commit body should include details such as why the changes are required and how the proposed changes
  - DCO Signed 
  
* If your PR is not getting reviewed or you need a specific person to review it, please reach out to the Litmus contributors at the [Litmus slack channel](https://app.slack.com/client/T09NY5SBT/CNXNB0ZTN)

## Sign your work 

We use the Developer Certificate of Origin (DCO) as an additional safeguard for the LitmusChaos project. This is a well established and widely used mechanism to assure that contributors have confirmed their right to license their contribution under the project's license. Please add a line to every git commit message:

```
  Signed-off-by: Random J Developer <random@developer.example.org>
```

Use your real name (sorry, no pseudonyms or anonymous contributions). The email id should match the email id provided in your GitHub profile. 
If you set your `user.name` and `user.email` in git config, you can sign your commit automatically with `git commit -s`. 

You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with `git ci` and the commit will be signed.

## Community

The litmus community will have a weekly contributor sync-up on Tuesdays 16.00-16.30IST / 12.30-13.00CEST 
- The sync up meeting is held online on [Google Hangouts](https://meet.google.com/uvt-ozaw-bvp)
- The release items are tracked in this [planning sheet](https://docs.google.com/spreadsheets/d/15svGB99bDcSTkwAYttH1QzP5WJSb-dFKbPzl-9WqmXM). 
