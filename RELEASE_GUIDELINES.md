# Versioning and Release Guidelines

This document details the versioning, release plan and release guidelines for LitmusChaos. Stability
is a top goal for this project, and we hope that this document and the processes
it entails will help to achieve that. It covers the release timelines, tracking, process, versioning
numbering, support horizons, and API stability.

If you rely on LitmusChaos, it would be good to spend time understanding the
areas of the API that are and are not supported and how they impact your
project in the future.

This document will be considered a living document. Scheduled releases, supported timelines, and API stability guarantees will be updated here as they
change.

If there is something that you require or this document leaves out, please
reach out by [filing an issue](https://github.com/litmuschaos/litmus/issues).

-   There is a scheduled release on the 15th of every month on the following repositories:
    -   [Litmus](https://github.com/litmuschaos/litmus)
    -   [Chaos-Operator](https://github.com/litmuschaos/chaos-operator)
    -   [Chaos-Runner](https://github.com/litmuschaos/chaos-runner)
    -   [Chaos-Exporter](https://github.com/litmuschaos/chaos-exporter)
    -   [Chaos-Charts](https://github.com/litmuschaos/chaos-charts)

-   Docker images with release tags are pushed upon creation of a github release 

-   Following are the docker images:
    -   [litmuschaos/ansible-runner](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/ansible-runner)
    -   [litmuschaos/chaos-operator](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-operator)
    -   [litmuschaos/chaos-runner](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-runner)
    -   [litmuschaos/chaos-exporter](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-exporter)

-   The chaos chart bundles are created by publishing the github releases for the [chaos-charts](https://github.com/litmuschaos/chaos-charts) repo. This is picked by the chaos [charthub](https://hub.litmuschaos.io) for user download.

-   The release flow consists of the following steps:

    -   Sprint Planning based on backlogs & feature requests from the community
    -   Feature Development with unit-tests & integration/bdd (behaviour driven development) tests
    -   Code/Enhancement freeze with release branch & RC1 (Release Candidate) creation
    -   User & Dev Documentation
    -   Execution of (end-to-end) tests against chaos charts, followed by fixes to issues identified
    -   Cherry pick of commits from master (fixes) to release branch
    -   Doc sanity tests
    -   Litmus release with change log

## Releases

Releases of LitmusChaos will be versioned using dotted triples, similar to
[Semantic Version](http://semver.org/). For the purposes of this document, we
will refer to the respective components of this triple as
`<major>.<minor>.<patch>`. The version number may have additional information,
such as alpha, beta and release candidate qualifications. Such releases will be
considered "pre-releases".

### Major and Minor Releases

Major and minor releases of LitmusChaos will be made from master. Releases of
LitmusChaos will be marked with GPG signed tags and announced at
https://github.com/litmuschaos/litmus/releases. The tag will be of the
format `<major>.<minor>.<patch>` and should be made with the command `git tag
-s <major>.<minor>.<patch>`.

After a minor release, a branch will be created, with the format
`release-<major>.<minor>.x` from the minor tag. All further patch releases will
be done from that branch. For example, once we release `1.0.0`, a branch
`release-1.0.x` will be created from that tag. All future patch releases will be
done against that branch.

### Pre-releases

Pre-releases, such as alphas, betas and release candidates will be conducted
from their source branch. For major and minor releases, these releases will be
done from main. For patch releases, these pre-releases should be done within
the corresponding release branch.

While pre-releases are done to assist in the stabilization process, no
guarantees are provided.

### Upgrade Path

The upgrade path for LitmusChaos is such that the 0.0.x patch releases are
always backward compatible with its major and minor version. Minor (0.x.0)
version will always be compatible with the previous minor release. i.e. 1.2.0
is backwards compatible with 1.1.0 and 1.1.0 is compatible with 1.0.0. There is
no compatibility guarantees for upgrades that span multiple, _minor_ releases.
For example, 1.0.0 to 1.2.0 is not supported. One should first upgrade to 1.1,
then 1.2.

There are no compatibility guarantees with upgrades to _major_ versions. For
example, upgrading from 1.0.0 to 2.0.0 may require resources to migrated or
integrations to change. Each major version will be supported for at least 1
year with bug fixes and security patches.

### Next Release

The activity for the next release will be tracked in the
[project board](https://github.com/litmuschaos/litmus/projects). If your
issue or PR is not present in the project board, please reach out to the maintainers or discuss the same on the #litmus-dev slack channel  to create the milestone or add an issue or PR to an existing milestone.

### Support Horizon

Support horizons will be defined corresponding to a release branch, identified
by `<major>.<minor>`. Release branches will be in one of several states:

- __*Next*__: The next planned release branch.
- __*Active*__: The release is a stable branch which is currently supported and accepting patches.
- __*Extended*__: The release branch is only accepting security patches.
- __*LTS*__: The release is a long term stable branch which is currently supported and accepting patches.
- __*End of Life*__: The release branch is no longer supported and no new patches will be accepted.

Releases will be supported at least one year after a _minor_ release. This means that
we will accept bug reports and backports to release branches until the end of
life date. If no new _minor_ release has been made, that release will be
considered supported until 6 months after the next _minor_ is released or one year,
whichever is longer. Additionally, releases may have an extended security support
period after the end of the active period to accept security backports. This
timeframe will be decided by maintainers before the end of the active status.

Long term stable (_LTS_) releases will be supported for at least three years after
their initial _minor_ release. These branches will accept bug reports and
backports until the end of life date. They may also accept a wider range of
patches than non-_LTS_ releases to support the longer term maintainability of the
branch, including library dependency, toolchain (including Go) and other version updates
which are needed to ensure each release is built with fully supported dependencies and
remains usable by LitmusChaos clients. _LTS_ releases can also accept feature backports
to support new Kubernetes releases. The default action has to be reject it though,
for long-term stability. This is still negotiable when the feature is a hard dependency
for a new release of Kubernetes. There should be at least a 6-month overlap between
the end of life of an _LTS_ release and the initial release of a new _LTS_ release.
Up to 6 months before the announced end of life of an _LTS_ branch, the branch may
convert to a regular _Active_ release with stricter backport criteria.

The current state is available in the following tables:

| Release                                                              | Status        | Start              | End of Life                                             |
| ---------                                                            | ------------- | ------------------ | -------------------                                     |
| [0.x  {0.6 - 0.9}](https://github.com/litmuschaos/litmus/releases/tag/0.9.0) | End of Life | Sept 13, 2019      | Jun 15, 2020                                                    |
| [1.x  {1.0 - 1.13}](https://github.com/litmuschaos/litmus/releases/tag/1.13.8)  | End of Life   | Jan 8, 2020       | -                                                       |
| [2.0 beta  {2.0 beta 0 to 2.0 beta 9}](https://github.com/litmuschaos/litmus/releases/tag/2.0.0-Beta9)     | End of Life   | Mar 05, 2021       | July 15, 2021                                        |
| [2.x](https://github.com/litmuschaos/litmus/releases/tag/2.14.0)  | End of Life   | Aug 9, 2021  | September 5, 2023                                       |
| [3.x beta](https://github.com/litmuschaos/litmus/releases/tag/3.0.0-beta12)  | End of Life   | Nov 16, 2022     | Nov 15, 2023                                        |
| [3.x](https://github.com/litmuschaos/litmus/releases/tag/3.6.1)  | Active        | Oct 04, 2023     | active(release of 4.0 + 6 months), |
| [4.0](https://github.com/litmuschaos/litmus/blob/master/ROADMAP.md)         | Next          | TBD                | TBD                                                     |

> **_NOTE_** LitmusChaos v3.x will end of life at the same time as v4.x reaches full stability. Due to
> [Minimal Version Selection](https://go.dev/ref/mod#minimal-version-selection) used
> by Go modules, 3.x must be supported until EOL of all 3.x releases. Once 3.x is in
> extended support, it will continue to accept security patches in addition to client
> changes relevant for package importers.

### Kubernetes Support

The Kubernetes version matrix represents the versions of LitmusChaos which are
recommended for a Kubernetes release. Any actively supported version of
LitmusChaos may receive patches to fix bugs encountered in any version of
Kubernetes, however, our recommendation is based on which versions have been
the most thoroughly tested. See the [Kubernetes test grid](https://testgrid.k8s.io/sig-node-LitmusChaos)
for the list of actively tested versions. Kubernetes only supports n-3 minor
release versions and LitmusChaos will ensure there is always a supported version
of LitmusChaos for every supported version of Kubernetes.

| Kubernetes Version  | LitmusChaos Version | 
|---------------------|---------------------|
| 1.26                | 1.x, 2.x, 3.x       | 
| 1.27                | 3.x                 | 
| 1.28                | 3.x                 | 
| 1.29                | 3.x                 | 
| 1.30                | 3.x, 4.0(wip)       |


## Public API Stability

The following table provides an overview of the components covered by
LitmusChaos versions:


| Component        | Status   | Stabilized Version | Links         |
|------------------|----------|--------------------|---------------|
| GraphQL API         | Stable   | 1.0                | [graphql API]() |
| Go client API    | Stable   | 2.0                | [godoc]() |


From the version stated in the above table, that component must adhere to the
stability constraints expected in release versions.

Unless explicitly stated here, components that are called out as unstable or
not covered may change in a future minor version. Breaking changes to
"unstable" components will be avoided in patch versions.

Go client API stability includes the `client`, `defaults` and `version` package
as well as all packages under `pkg`, `core`, `api` and `protobuf`.
All packages under `cmd`, `contrib`, `integration`, and `internal` are not
considered part of the stable client API.



### Release Checklist

* [ ] Release branch creation on litmus component repos
* [ ] Release candidate github tags/images created
* [ ] Full e2e pipelines on the release candidates
* [ ] Fixes to litmus components based on test results & e2e re-runs
* [ ] Cherry-pick commits to release branches & additional RC tags/images
* [ ] GA tags/images creation
* [ ] Release branch creation on chaos-charts repo, GA image updates & chart GA bundle creation
* [ ] PRs to user artefact/deploy repos:
    * [ ] litmuschaos/litmus (docs/litmus-operator-<release_version>.yaml)
    * [ ] litmuschaos/litmus-helm (litmus infra helm chart)
    * [ ] litmuschaos/chaos-helm (chaosexperiment bundles)
* [ ] Chaos ChartHub Sanity Check
* [ ] Sanity e2e runs on GA images
* [ ] Docs sanity & (docusaurus) versioned docs creation
* [ ] Release Notes publish
* [ ] Updates to Releases & Roadmap artefacts
* [ ] Updates to downstream repos (litmuschaos/litmus-demo) etc.,
* [ ] Community Announcements, sync up & contributor shout out!
