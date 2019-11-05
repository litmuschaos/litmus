## RELEASE GUIDELINES

-   There is a scheduled release on the 15th of every month on the following repositories:
    -   [Litmus](https://github.com/litmuschaos/litmus)
    -   [Chaos-Operator](https://github.com/litmuschaos/chaos-operator)
    -   [Chaos-Exporter](https://github.com/litmuschaos/chaos-exporter)

-   Repositories use release version according to the [Semantic Versioning](https://semver.org/)

-   Docker images with release tags are pushed upon creation of a github release. The CI configuration to enable this can be found on the following repositories:
    -   [Litmus](https://github.com/litmuschaos/litmus/blob/master/.travis.yml)
    -   [Chaos-Operator](https://github.com/litmuschaos/chaos-operator/blob/master/.circleci/config.yml)
    -   [Chaos-Exporter](https://github.com/litmuschaos/chaos-exporter/blob/master/.travis.yml)

-   Following are the docker images:
    -   [litmuschaos/ansible-runner](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/ansible-runner)
    -   [litmuschaos/chaos-operator](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-operator)
    -   [litmuschaos/chaos-exporter](https://cloud.docker.com/u/litmuschaos/repository/docker/litmuschaos/chaos-exporter)

-   Tracking of releases is done on Github [project board](https://github.com/litmuschaos/litmus/projects)

-   The flow of the release is done by the following steps:
    -   Sprint Planning with feature request from the community
    -   Development of feature
    -   RC1 build
    -   More RC build will be done on a need basis
    -   Testing is done after the RC1 build
    -   Cherry picking the commits to the release branch post RC build
    -   Release is done

-   Releases
    -   Pre Release Version (Development)
         <table>
          <tr>
            <td>0.8.0-RC-1</td>
            <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
            <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.8.0-RC1">Release Notes</a></td>
          </tr>
        </table>

    -   Current version (Stable)
        <table>
          <tr>
            <td>0.7.0</td>
            <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
            <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.7.0">Release Notes</a></td>
          </tr>
        </table>

    -   Past Versions
        Here you can find previous versions of the documentation.
        <table>
          <tr>
            <td>0.6.0</td>
            <td><a href="https://docs.litmuschaos.io/docs/0.6.0/overview">Documentation</a></td>
            <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.6.0">Release Notes</a></td>
          </tr>
        </table>

-   For more info, please visit [here](https://docs.litmuschaos.io/versions/).
