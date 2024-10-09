<img alt="LitmusChaos" src="https://avatars.githubusercontent.com/u/49853472?s=200&v=4" width="200" align="left">

# [LitmusChaos](https://litmuschaos.io/)
### Open Source Chaos Engineering Platform

[![Slack Channel](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
![GitHub Workflow](https://github.com/litmuschaos/litmus/actions/workflows/push.yml/badge.svg?branch=master)
[![Docker Pulls](https://img.shields.io/docker/pulls/litmuschaos/chaos-operator.svg)](https://hub.docker.com/r/litmuschaos/chaos-operator)
[![GitHub stars](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![Twitter Follow](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/3202/badge)](https://www.bestpractices.dev/projects/3202)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![YouTube Channel](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br><br><br>

#### *Read this in [other languages](translations/TRANSLATIONS.md).*

[🇰🇷](translations/README-ko.md) [🇨🇳](translations/README-chn.md) [🇧🇷](translations/README-pt-br.md) [🇮🇳](translations/README-hi.md)


## Overview

LitmusChaos is an open source Chaos Engineering platform that enables teams to identify weaknesses & potential outages in infrastructures by 
inducing chaos tests in a controlled way. Developers & SREs can practice Chaos Engineering with LitmusChaos as it is easy to use, based on modern 
Chaos Engineering principles & community collaborated. It is 100% open source & a CNCF project.

LitmusChaos takes a cloud-native approach to create, manage and monitor chaos. The platform itself runs as a set of microservices and uses Kubernetes 
custom resources (CRs) to define the chaos intent, as well as the steady state hypothesis. 

At a high-level, Litmus comprises of:  

- **Chaos Control Plane**: A centralized chaos management tool called chaos-center, which helps construct, schedule and visualize Litmus chaos workflows  
- **Chaos Execution Plane Services**: Made up of a chaos agent and multiple operators that execute & monitor the experiment within a defined 
  target Kubernetes environment. 

![architecture summary](/images/litmus-control-and-execution-plane-overview.png)

At the heart of the platform are the following chaos custom resources: 

- **ChaosExperiment**: A resource to group the configuration parameters of a particular fault. ChaosExperiment CRs are essentially installable templates 
  that describe the library carrying out the fault, indicate permissions needed to run it & the defaults it will operate with. Through the ChaosExperiment,  Litmus supports BYOC (bring-your-own-chaos) that helps integrate (optional) any third-party tooling to perform the fault injection. 

- **ChaosEngine**: A resource to link a Kubernetes application workload/service, node or an infra component to a fault described by the ChaosExperiment. 
  It also provides options to tune the run properties and specify the steady state validation constraints using 'probes'. ChaosEngine is watched by the 
  Chaos-Operator, which reconciles it (triggers experiment execution) via runners. 

The ChaosExperiment & ChaosEngine CRs are embedded within a Workflow object that can string together one or more experiments in a desired order.

- **ChaosResult**: A resource to hold the results of the experiment run. It provides details of the success of each validation constraint, 
  the revert/rollback status of the fault as well as a verdict. The Chaos-exporter reads the results and exposes information as prometheus metrics. 
  ChaosResults are especially useful during automated runs. 

ChaosExperiment CRs are hosted on <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. It is a central hub where the 
application developers or vendors share their chaos experiments so that their users can use them to increase the resilience of the applications 
in production.

## Use cases

- **For Developers**: To run chaos experiments during application development as an extension of unit testing or integration testing.
- **For CI/CD pipeline builders**: To run chaos as a pipeline stage to find bugs when the application is subjected to fail paths in a pipeline.
- **For SREs**: To plan and schedule chaos experiments into the application and/or surrounding infrastructure. This practice identifies the weaknesses 
  in the deployment system and increases resilience.

## Getting Started with Litmus

To get started, check out the <a href="https://docs.litmuschaos.io/docs/introduction/what-is-litmus" target="_blank">Litmus Docs</a> and specifically the <a href="https://docs.litmuschaos.io/docs/getting-started/installation#prerequisites" target="_blank">Installation section</a> of the <a href="https://docs.litmuschaos.io/docs/getting-started/installation" target="_blank">Getting Started with Litmus</a> page.

## Contributing to Chaos Hub

Check out the <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Contributing Guidelines for the Chaos Hub</a>


## Community

### Community Resources:

Feel free to reach out if you have any queries,concerns, or feature requests

- Give us a star ⭐️ - If you are using LitmusChaos or think it is an interesting project, we would love a star ❤️

- Follow LitmusChaos on Twitter [@LitmusChaos](https://twitter.com/LitmusChaos).

- Subscribe to the [LitmusChaos YouTube channel](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw) for regular updates & meeting recordings. 

- To join our [Slack Community](https://slack.litmuschaos.io/) and meet our community members, put forward your questions & opinions, join the #litmus channel on the [Kubernetes Slack](https://slack.k8s.io/). 
### Community Meetings

1. Community Meetings
These will be hosted every 3rd Wednesday of every month at  5:30 PM GMT /6:30 PM CEST /10 PM IST
The community meetings will involve discussing community updates, sharing updates on new features/releases and discussing user/adopter stories. Everyone in the community is invited for the same to participate in the LitmusChaos community meetings.


2. Contributor Meetings
These will be hosted every second & last Thursday of every month at  2:30 PM GMT /3:30 PM CEST /7 PM IST
The contributor meetings are only meant to discuss technical and non-technical contributions to LitmusChaos. Maintainers, present Contributors and aspiring contributors are invited to participate in the LitmusChaos contributor meetings to discuss issues, fixes, enhancements and future contributions


Fill out the [LitmusChaos Meetings invite form](https://forms.gle/xYZyZ2gTWMqz7xSs7) to get your Calendar invite!  


- [Sync Up Meeting Link](https://harness-io.zoom.us/j/95100368978?pwd=b2VrdCtaakE5U3dhOElFMUJOaXVOUT09)
- [Sync Up Agenda & Meeting Notes](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

### Videos

- [Cloud Native Live: Litmus Chaos Engine and a microservices demo app](https://youtu.be/hOghvd9qCzI)
- [Chaos Engineering hands-on - An SRE ideating Chaos Experiments and using LitmusChaos | July 2022](https://youtu.be/_x_7SiesjF0) 
- [Achieve Digital Product Resiliency with Chaos Engineering](https://youtu.be/PQrmBHgk0ps)
- [How to create Chaos Experiments with Litmus | Litmus Chaos tutorial](https://youtu.be/mwu5eLgUKq4) @ [Is it Observable](https://www.youtube.com/c/IsitObservable)
- [Cloud Native Chaos Engineering Preview With LitmusChaos](https://youtu.be/pMWqhS-F3tQ)
- [Get started with Chaos Engineering with Litmus](https://youtu.be/5CI8d-SKBfc) @ [Containers from the Couch](https://www.youtube.com/c/ContainersfromtheCouch)
- [Litmus 2 - Chaos Engineering Meets Argo Workflows](https://youtu.be/B8DfYnDh2F4) @ [DevOps Toolkit](https://youtube.com/c/devopstoolkit)
- [Hands-on with Litmus 2.0 | Rawkode Live](https://youtu.be/D0t3emVLLko) @ [Rawkode Academy](https://www.youtube.com/channel/UCrber_mFvp_FEF7D9u8PDEA)
- [Introducing LitmusChaos 2.0 / Dok Talks #74](https://youtu.be/97BiCNtJbDw) @ [DoK.community](https://www.youtube.com/channel/UCUnXJbHQ89R2uSfKsqQwGvQ)
- [Introduction to Cloud Native Chaos Engineering](https://youtu.be/LK0oDLQE4S8) @ [Kunal Kushwaha](https://www.youtube.com/channel/UCBGOUQHNNtNGcGzVq5rIXjw)
- [#EveryoneCanContribute cafe: Litmus - Chaos Engineering for your Kubernetes](https://youtu.be/IiyrEiK4stQ) @ [GitLab Unfiltered](https://www.youtube.com/channel/UCMtZ0sc1HHNtGGWZFDRTh5A)
- [Litmus - Chaos Engineering for Kubernetes (CNCFMinutes 9)](https://youtu.be/rDQ9XKbSJIc) @ [Saiyam Pathak](https://www.youtube.com/channel/UCi-1nnN0eC9nRleXdZA6ncg)
- [Chaos Engineering with Litmus Chaos by Prithvi Raj || HACKODISHA Workshop](https://youtu.be/eyAG0svCsQA) @ [Webwiz](https://www.youtube.com/channel/UC9yM_PkV0QIIsPA3qPrp)

[And More....](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)

### Blogs

- CNCF: [Introduction to LitmusChaos](https://www.cncf.io/blog/2020/08/28/introduction-to-litmuschaos/)
- Hackernoon: [Manage and Monitor Chaos via Litmus Custom Resources](https://hackernoon.com/solid-tips-on-how-to-manage-and-monitor-chaos-via-litmus-custom-resources-5g1s33m9)
- [Observability Considerations in Chaos: The Metrics Story](https://dev.to/ksatchit/observability-considerations-in-chaos-the-metrics-story-6cb)

Community Blogs:

- LiveWyer: [LitmusChaos Showcase: Chaos Experiments in a Helm Chart Test Suite](https://livewyer.io/blog/2021/03/22/litmuschaos-showcase-chaos-experiments-in-a-helm-chart-test-suite/)
- Jessica Cherry: [Test Kubernetes cluster failures and experiments in your terminal](https://opensource.com/article/21/6/kubernetes-litmus-chaos)
- Yang Chuansheng(KubeSphere): [KubeSphere 部署 Litmus 至 Kubernetes 开启混沌实验](https://kubesphere.io/zh/blogs/litmus-kubesphere/)
- Saiyam Pathak(Civo): [Chaos Experiments on Kubernetes using Litmus to ensure your cluster is production ready](https://www.civo.com/learn/chaos-engineering-kubernetes-litmus)
- Andreas Krivas(Container Solutions):[Comparing Chaos Engineering Tools for Kubernetes Workloads](https://blog.container-solutions.com/comparing-chaos-engineering-tools)
- Akram Riahi(WeScale):[Chaos Engineering : Litmus sous tous les angles](https://blog.wescale.fr/2021/03/11/chaos-engineering-litmus-sous-tous-les-angles/)
- Prashanto Priyanshu(LensKart):[Lenskart’s approach to Chaos Engineering-Part 2](https://blog.lenskart.com/lenskarts-approach-to-chaos-engineering-part-2-6290e4f3a74e)
- DevsDay.ru(Russian):[LitmusChaos at Kubecon EU '21](https://devsday.ru/blog/details/40746)


## Adopters

Check out the <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Adopters of LitmusChaos</a>

(_Send a PR to the above page if you are using Litmus in your chaos engineering practice_)

## License

Litmus is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text. Some of the projects used by the Litmus project may be governed by a different license, please refer to its specific license.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos is part of the CNCF Projects.

[![CNCF](https://github.com/cncf/artwork/blob/main/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/?selected=litmus)

## Important Links

<a href="https://docs.litmuschaos.io">
  Litmus Docs <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/?selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/cncf-landscape-horizontal-color.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
