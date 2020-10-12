## RELEASE GUIDELINES

-   There is a scheduled release on the 15th of every month on the following repositories:
    -   [Litmus](https://github.com/litmuschaos/litmus)
    -   [Chaos-Operator](https://github.com/litmuschaos/chaos-operator)
    -   [Chaos-Runner](https://github.com/litmuschaos/chaos-runner)
    -   [Chaos-Exporter](https://github.com/litmuschaos/chaos-exporter)
    -   [Chaos-Charts](https://github.com/litmuschaos/chaos-charts)

-   Repositories use release version according to the [Semantic Versioning](https://semver.org/)

-   Docker images with release tags are pushed upon creation of a github release 

-   Following are the docker images:
    -   [litmuschaos/ansible-runner](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/ansible-runner)
    -   [litmuschaos/chaos-operator](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-operator)
    -   [litmuschaos/chaos-runner](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-runner)
    -   [litmuschaos/chaos-exporter](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-exporter)

-   The chaos chart bundles are created by publishing the github releases for the [chaos-charts](https://github.com/litmuschaos/chaos-charts) repo. This is picked by the chaos [charthub](https://hub.litmuschaos.io) for user download.

-   Tracking of releases is done on Github [project board](https://github.com/litmuschaos/litmus/projects)

-   The release flow consists of the following steps:

    -   Sprint Planning based on backlogs & feature requests from the community
    -   Feature Development with unit-tests & integration/bdd (behaviour driven development) tests
    -   Code/Enhancement freeze with release branch & RC1 (Release Candidate) creation
    -   User & Dev Documentation
    -   Execution of (end-to-end) tests against chaos charts, followed by fixes to issues identified
    -   Cherry pick of commits from master (fixes) to release branch
    -   Doc sanity tests
    -   Litmus release with change log

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
