## RELEASE GUIDELINES

-   There is a scheduled release on the 15th of every month on the following repositories:
    -   [Litmus](https://github.com/litmuschaos/litmus)
    -   [Chaos-Operator](https://github.com/litmuschaos/chaos-operator)
    -   [Chaos-Exporter](https://github.com/litmuschaos/chaos-exporter)

-   Repositories use release version according to the [Semantic Versioning](https://semver.org/)

-   Docker images with release tags are pushed upon creation of a github release (commits to master push images with `ci` tags) 

-   Following are the docker images:
    -   [litmuschaos/ansible-runner](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/ansible-runner)
    -   [litmuschaos/chaos-operator](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-operator)
    -   [litmuschaos/chaos-exporter](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-exporter)

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

