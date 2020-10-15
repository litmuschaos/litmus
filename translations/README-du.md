<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus
### Cloud-Native Chaos Engineering

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

#### *Read this in [other languages](translations/TRANSLATIONS.md).*
[🇰🇷](translations/README-ko.md) [🇨🇳](translations/README-chn.md)

## Overview
Lackmus ist ein Toolset für Cloud-native Chaos-Engineering. Litmus bietet Tools, um das Chaos auf Kubernetes zu orchestrieren und SREs dabei zu helfen, Schwachstellen in ihren Bereitstellungen zu finden. SREs verwenden Litmus, 
um Chaos-Experimente zunächst in der Staging-Umgebung und schließlich in der Produktion durchzuführen, um Fehler und Schwachstellen zu finden. Das Beheben der Schwachstellen führt zu einer erhöhten Ausfallsicherheit des Systems.

Lackmus verfolgt einen Cloud-nativen Ansatz, um Chaos zu erzeugen, zu verwalten und zu überwachen. Chaos wird mithilfe der folgenden benutzerdefinierten Ressourcendefinitionen (** CRDs **) von Kubernetes orchestriert:

- **ChaosEngine**: Eine Ressource zum Verknüpfen einer Kubernetes-Anwendung oder eines Kubernetes-Knotens mit einem ChaosExperiment. ChaosEngine wird von Litmus 'Chaos-Operator beobachtet, der dann Chaos-Experimente aufruft
- **ChaosExperiment**: Eine Ressource zum Gruppieren der Konfigurationsparameter eines Chaos-Experiments. ChaosExperiment-CRs werden vom Bediener erstellt, wenn Experimente von ChaosEngine aufgerufen werden.
- **ChaosResult**: Eine Ressource, um die Ergebnisse eines Chaos-Experiments zu speichern. Der Chaos-Exporter liest die Ergebnisse und exportiert die Metriken in einen konfigurierten Prometheus-Server.

Chaos-Experimente werden auf <a href="https://hub.litmuschaos.io" target="_blank"> hub.litmuschaos.io </a> gehostet. Es ist ein zentraler Knotenpunkt, an dem Anwendungsentwickler oder -anbieter ihre Chaos-Experimente austauschen, 
damit ihre Benutzer sie verwenden können, um die Ausfallsicherheit der Anwendungen in der Produktion zu erhöhen.

![Litmus workflow](/images/litmus-arch_1.png)

## Use cases

- **Für Entwickler**: Durchführung von Chaos-Experimenten während der Anwendungsentwicklung als Erweiterung von Unit-Tests oder Integrationstests.
- **Für CI-Pipeline-Builder**: Chaos als Pipeline-Phase ausführen, um Fehler zu finden, wenn die Anwendung Fehlerpfaden in einer Pipeline ausgesetzt ist.
- **Für SREs**: Planen und Planen von Chaos-Experimenten in der Anwendung und / oder der umgebenden Infrastruktur. Diese Vorgehensweise identifiziert die Schwachstellen im System und erhöht die Ausfallsicherheit.

## Getting Started with Litmus

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Check out the <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">Litmus Docs</a> to get started.

## Contributing to Chaos Hub

Check out the <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Contributing Guildelines for the Chaos Hub</a>

## Adopters

Check out the <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Adopters of LitmusChaos</a>

(_Send a PR to the above page if you are using Litmus in your chaos engineering practice_)

## Things to Consider

Some of the considerations that need to be made with Litmus (as a chaos framework), are broadly listed here. Many of these are already being worked on
as mentioned in the [ROADMAP](./ROADMAP.md). For details or limitations around specific experiments, refer to the respective [experiments docs](https://docs.litmuschaos.io/docs/pod-delete/).

- Litmus chaos operator and the chaos experiments run as kubernetes resources in the cluster. In case of airgapped environments, the chaos custom resources
  and images need to be hosted on premise.
- When attempting to execute platform specific chaos experiments (like those on AWS, GCP cloud) the access details are passed via kubernetes secrets. Support
  for other modes of secret management with Litmus is yet to be tested/implemented.
- Some chaos experiments make use of the docker api from within the experiment pods, and thereby require the docker socket to be mounted. User discretion is
  advised when allowing developers/devops admins/SREs access for running these experiments.
- In (rare) cases where chaos experiments make use of privileged containers, the recommended security policies will be documented.

## License

Litmus is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text. Some of the projects used by the Litmus project may be governed by a different license, please refer to its specific license.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos is part of the CNCF Projects.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Community

Die Lackmus-Community trifft sich jeden dritten Mittwoch im Monat um 22:00 Uhr IST / 9:30 Uhr PST.

Community-Ressourcen:

- [Community Slack](https://slack.litmuschaos.io)
- [Sync Up Meeting Link](https://zoom.us/j/91358162694)
- [Sync Up Agenda & Meeting Notes](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Youtube Channel (demos, meeting recordings, virtual meetups)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Important Links

<a href="https://docs.litmuschaos.io">
  Litmus Docs <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
