<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# 石蕊(Litmus)
### 云原生的混沌工程

[![Slack Channel](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
[![CircleCI](https://circleci.com/gh/litmuschaos/litmus/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/litmuschaos/litmus)
[![Docker Pulls](https://img.shields.io/docker/pulls/litmuschaos/chaos-operator.svg)](https://hub.docker.com/r/litmuschaos/chaos-operator)
[![GitHub stars](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![Twitter Follow](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/3202/badge)](https://bestpractices.coreinfrastructure.org/projects/3202)
[![BCH compliance](https://bettercodehub.com/edge/badge/litmuschaos/litmus?branch=master)](https://bettercodehub.com/)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![YouTube Channel](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br><br><br>

## 简介

石蕊是一组用于云原生混沌工程的工具。石蕊为运维人员提供了人工控制混沌的工具，用以在所部署的环境中找到软件设计的缺陷。运维人员可以使用石蕊在暂存区乃至生产环境里通过混沌实验来找出逻辑错误和软件漏洞。通过修复这些软件的缺陷，可以提升系统的整体抗打击能力。

石蕊以云原生的方法来创建，管理和监控混沌事件，通过以下的KubernetesCRD对象来实现对混沌事件的编排：

- **ChaosEngine**: 通过这个对象来关联一个Kubernnetes的应用或是Kubernetes节点。石蕊的Chaos-Operator会watch这个对象并触发混沌事件。
- **ChaosExperiment**: 这个对象包含了一组混沌事件的配置。当ChaoseEngine触发混沌事件的时候，operator就会创建ChaoseExpeiment对象。
- **ChaosResult**: 这个对象会保留混沌事件的结果。这个对象是ChaosEngine触发混沌事件时由operator创建的。

我们在<a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>建立了公共平台用于存放了混沌事件。在这里，开发者和vendor可以分享自己的定义的混沌事件以提高各自产品的抗打击能力。

![石蕊的工作流程](/images/litmus-arch_1.png)

## 案例

- **开发者**: 在软件开发阶段通过运行混沌测试作为单元测试，集成测试的补充。
- **CI开发者**: 通过在测试流水线里增加混沌测试检测是否软件会在特定的执行路径下失效。
- **运维**: 规划针对应用或其基础设施的混沌测试从而找出系统的弱点以提升抗打击能力。

## 如何使用石蕊

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

请看此处 <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">Litmus Docs</a>.

## 为ChaosHub添砖加瓦

Check out the <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Contributing Guildelines for the Chaos Hub</a>

## 使用者名单

请看此处 <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Adopters of LitmusChaos</a>

(_如果你也是石蕊的使用者，请向该页面发送PR_)

## 注意事项

我们列举了一些将石蕊作为混沌工程框架应用需要做的一些考量，在[ROADMAP](./ROADMAP.md)我们已经提及了一些改进的方案。
对于某一具体混沌测试的局限性，请参考其各自的文档[experiments docs](https://docs.litmuschaos.io/docs/pod-delete/)。

- 网络混沌测试目前不支持除Docker以外的容器运行时，如containerd和CRIO
- 石蕊混沌控制器以及混沌测试对象以Kubernetes资源的形式运行于Kubernetes集群中。在airgap环境需要在把镜像以及CR定义预先加载到机器上。
- 对于特定公有云平台(如AWS，GCP)，账号信息是通过Kubernetes secret的方式传入的。别的传入方式尚需进一步测试及实现。
- 一些混沌测试需要从pod里调用Docker API所以需要挂载Docker socket。需要自行判断是否要给开发者/运维权限来运行这些测试。
- 在一些(少数)情况下混沌测试需要privileged container权限，我们会记录推荐的安全策略。

## 开源证书

石蕊使用的证书为Apache License, Version 2.0. 全文请见[LICENSE](./LICENSE). 一些由石蕊所使用的软件可能使用了不同的证书，使用时请分别参考这些软件各自的证书.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos 已隶属CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## 社区

石蕊社区的会议时间为每月的第三个周三10:00PM IST/9.30 AM PST。

社区资源:

- [Community Slack](https://slack.litmuschaos.io)
- [Sync Up Meeting Link](https://zoom.us/j/91358162694)
- [Sync Up Agenda & Meeting Notes](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Youtube Channel (demos, meeting recordings, virtual meetups)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## 重要链接

<a href="https://docs.litmuschaos.io">
  Litmus Docs <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
