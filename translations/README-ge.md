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

#### *Das README in [anderen Sprachen](translations/TRANSLATIONS.md).*

[KR](https://github.com/litmuschaos/litmus/blob/master/translations/README-ko.md) [CN](https://github.com/litmuschaos/litmus/blob/master/translations/README-chn.md) [GB](https://github.com/litmuschaos/litmus/blob/master/README.md)

## Überblick

Litmus ist ein Werkzeug für cloud-natives Chaos Engineering. Die Anwendung stellt
verschiedene Hilfsmittel bereit, um Chaos auf Kubernetes zu inszenieren und hilft
somit SREs dabei, Schwachstellen in ihren Systemen zu finden.
Mit Litmus können Chaos-Experimente in der Staging- und gegebenenfalls
auch in der Produktionsumgebung durchgeführt werden, um Schwachstellen und Bugs zu
finden.

Litmus nutzt einen cloud-nativen Ansatz um Chaos zu erzeugen, zu verwalten und zu
beobachten. Um Chaos zu initialisieren und zu manipulieren werden die folgenden
Kubernetes Custom Resource Definitions (kurz CRDs) benötigt:
- **ChaosEngine**: Mittel, um eine Kubernetes-Anwendung oder einen
  Kubernetes-Node mit einem Chaos-Experiment zu verbinden. Die Chaos-Engine wird
  vom Chaos-Operator beobachtet, welcher die Chaos-Experimente ausführt.
- **ChaosExperiment**: Mittel, um die Konfigurationsparameter eines
  Chaos-Experiments zu gruppieren. Chaos-Experiment CRs werden vom Operator
  kreiert, wenn Experimente von der Chaos-Engine ausgeführt werden.
- **ChaosResult**: Mittel, um die Ergebnisse des Chaos-Experiments zu
  speichern. Der Chaos-Exporter liest die Ergebnisse aus und exportiert die
  Messwerte auf einen konfigurierten Prometheus-Server.

Die Chaos-Experimente werden auf <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a> gehostet. Das ist die zentrale Stelle, an der die Entwickler von Anwendungen oder die Nutzer ihre Chaos-Experimente teilen, sodass diese genutzt werden können, um die Belastbarkeit und Sicherheit der Anwendung im Endeinsatz weiter zu verbessern. 

![Litmus workflow](/images/litmus-arch_1.png)

## Anwendung

- **Für Entwickler**: Mit Litmus können Chaos-Experimente in der
  Entwicklungsphase einer Anwendung als Erweiterung zu Modultests
  oder auch Integrationstests durchgeführt werden.
- **Für CI-Pipelines**: Im Continuous Integration Prozess können
  Chaos-Experimente als Schritt in der Pipeline genutzt werden, um Bugs zu
  finden.
- **Für SREs**: Mit Litmus können Chaos-Experimente geplant und durchgeführt
  werden, um möglichst früh Schwächen in Anwendungen zu finden und die
  Stabilität des Systems zu steigern.

## Mit Litmus loslegen

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Erste Informationen findet man in der <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">Litmus Dokumentation (Seite aktuell noch auf Englisch)</a>.

## Am Chaos Hub mitarbeiten

Erste Informationen findet man in den <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Guidelines für Mitwirkende des Chaos Hub (Seite aktuell noch auf Englisch)</a>

## Anwender

Informationen befinden sich hier: <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Anwender von LitmusChaos</a>

(_Sende bitte einen PR an die Seite, wenn Du in deiner Anwendungen oder
während der Entwicklung Litmus zum Chaos Engineering nutzen_)

## Anmerkungen

Ein paar relevante Dinge, die bei der Arbeit mit Litmus zu beachten sind, sind im Folgenden
aufgelistet. Die meisten offenen Punkte sind bereits Teil der [Roadmap](./ROADMAP.nd). Für Details zu den
Einschränkungen bestimmter Experimente empfiehlt sich ein Blick in die
jeweilige [Dokumentation](https://docs.litmuschaos.io/docs/pod-delete/).

- Der Chaos-Operator sowie die Chaos-Experimente laufen als Kubernetes-Ressourcen auf einem Cluster. Im Falle von air-gapped Umgebungen oder Netzwerken müssen die Chaos-Ressourcen unter dieser Prämisse gehostet werden.
- Wenn plattform-spezifische Chaos-Experimente (vgl. die von AWS und der GCP Cloud) durchgeführt werden sollen, werden die nötigen Informationen über Kubernetes Secrets bereitgestellt. Andere Möglichkeiten diese Informationen und Daten sicher weiterzugeben sind aktuell noch nicht getestet oder implementiert.
- Einige Chaos-Experimente nutzen möglicherweise die Docker-API innerhalb der Experiment-Pods. In diesen Fällen muss der Docker-Socket in die entsprechenden Pods gemountet werden. Es ist ratsam, diese Experimente nur von vertrauenswürdigen Admins, SREs, Entwicklern oder DevOps ausführen zu lassen.
- In (seltenen) Fällen, bei denen die Chaos-Experimente Privileged-Container benutzen, werden die empfohlenen Sicherheitsrichtlinien dokumentiert.

## Lizenz

Litmus ist unter der Apache License, Version 2.0 zugelassen. Die komplette Lizenz
ist auf folgender Seite zu finden: [Lizenz](./LICENSE). Einige Projekte, die
von Litmus genutzt werden, sind eventuell anders Lizensiert.
Bitte schaue bei den jeweiligen Projekt nach.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)


Litmus Chaos ist Teil der CNCF Projekte.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Gemeinschaft

Die Litmus Community trifft sich immer am dritten Mittwoch jeden Monats um
10:00PM IST oder 9:30 AM PST.

Kommunikationskanäle zum Austausch und für weitere Informationen:

- [Community Slack](https://slack.litmuschaos.io)
- [Sync Up Meeting Link](https://zoom.us/j/91358162694)
- [Sync Up Agenda & Meeting Notes](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Youtube Channel (demos, meeting recordings, virtual meetups)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Wichtige Links

<a href="https://docs.litmuschaos.io">
  Litmus Dokumentation <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
