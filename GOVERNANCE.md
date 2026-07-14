# LitmusChaos Project Governance

This document outlines the governance structure for the LitmusChaos project, a CNCF Incubating project. It describes the roles, responsibilities, decision-making processes, and mechanisms for community involvement.

We abide by the [Code of Conduct](./CODE_OF_CONDUCT.md) for all the projects maintained under the LitmusChaos Organization.

For specific guidance on practical contribution steps for any LitmusChaos sub-project please
see our [CONTRIBUTING.md](./CONTRIBUTING.md) guide and the sub-project specific contributing guides
in the respective GitHub repositories.

## Roles and Membership

Roles and their responsibilities are detailed in the [Community Membership](./community-roles.md) document.

The list of current maintainers and their organizational affiliations is maintained in the [MAINTAINERS.md](./MAINTAINERS.md) file.

## Vendor Neutrality

LitmusChaos, as a CNCF project, follows the principle of vendor neutrality.  
- No single company or organization should exercise exclusive control over the project.  
- Maintainers are expected to act in the best interest of the community as a whole, regardless of their employer.  
- Contributions and leadership roles are open to individuals from diverse organizations and backgrounds.  
- Project infrastructure, decision-making, and trademarks are owned and governed under the CNCF, ensuring a neutral and community-driven ecosystem.

## Conflict Resolution and Voting

Most issues within the project are resolved by consensus. When consensus cannot be reached, a voting process is initiated. All decisions are documented publicly, either in GitHub or in meeting notes.

### Voting Process

- **Threshold:** A vote passes with a simple majority.
- **Quorum:** At least 30% of maintainers must participate in the vote.
- **Voting Method:** Votes are cast by adding +1 or -1 to the associated GitHub issue or PR.
- **Binding Votes:** Each maintainer has one binding vote. Non-binding votes from the community are encouraged.
- **Organizational Limit:** No single organization can cast more than 40% of the eligible votes. Organizations with more than 40% of maintainers must designate voting members.
- **Duration:** Voting remains open for one week.

## How are decisions made?

LitmusChaos is an open-source project with an open design philosophy. This means
that the repository is the source of truth for EVERY aspect of the project,
including its philosophy, design, road map, and APIs. _If it's part of the
project, it's in the repo. If it's in the repo, it's part of the project._

As a result, all decisions can be expressed as changes to the repository. An
implementation change is a change to the source code. An API change is a change
to the API specification. A philosophy change is a change to the philosophy
manifesto, and so on.

All decisions affecting LitmusChaos, big and small, follow the same 3 steps:

- Step 1: Open a pull request. Anyone can do this.
- Step 2: Discuss the pull request. Anyone can do this.
- Step 3: Merge or refuse the pull request. Who does this depends on the nature
  of the pull request and which areas of the project it affects.

## Decision-Making Process

Most decisions are made through consensus. If consensus cannot be reached, maintainers may initiate a vote.

### Voting

- **Threshold:** A vote passes with a simple majority.
- **Quorum:** At least 30% of maintainers must participate in the vote.
- **Method:** Votes are cast using +1 (approve) or -1 (reject) in the relevant GitHub PR or issue.
- **Duration:** Voting remains open for one week.

## Community Support and Transparency

LitmusChaos aims for full transparency and inclusion in all governance activities. All decisions are made publicly and documented in the GitHub repositories or public meetings.

### Recurring Public Meetings

- #### Maintainers and Contributors Meeting

  Covers technical issues, future milestones, and roadmaps. Also focused on governance, membership, and the future direction of the project.

- #### Community Meeting

  Engages end users and the community with project updates, user presentations, and open discussions.

- #### Meeting Calendar

  Please fill [this invite form](https://forms.gle/AsuXB2hbTG2TyD2d9) to be added to the calendar

## Helping contributors with the DCO

The [DCO or `Sign your work`](./CONTRIBUTING.md#sign-your-work)
requirement is not intended as a roadblock or speed bump.

Some LitmusChaos contributors are not as familiar with `git`, or have used a web
based editor, and thus asking them to `git commit --amend -s` is not the best
way forward.

In this case, maintainers can update the commits based on clause (c) of the DCO.
The most trivial way for a contributor to allow the maintainer to do this, is to
add a DCO signature in a pull request's comment, or a maintainer can simply
note that the change is sufficiently trivial that it does not substantially
change the existing contribution - i.e., a spelling change.

When you add someone's DCO, please also add your own to keep a log.

## I'm a maintainer. Should I make pull requests too?

Yes. Nobody should ever push to master directly. All changes should be
made through a pull request.

## Adding sub-projects

Similar to adding maintainers, new sub projects can be added to LitmusChaos
GitHub organization as long as they adhere to the LitmusChaos vision and mission.
New projects are discussed in either the Contributor Meeting or the Community
slack and requires at least 1 maintainer approval.

If a project is approved, a maintainer will add the project to the LitmusChaos
GitHub organization, and make an announcement on a public forum.
