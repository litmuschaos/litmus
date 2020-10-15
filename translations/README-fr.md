<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus
### Ingénierie du chaos native du cloud

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

#### *Lisez ceci en [autres langues](translations/TRANSLATIONS.md)*

[🇰🇷](translations/README-ko.md) [🇨🇳](translations/README-chn.md)

## Aperçu

Litmus est un ensemble d'outils pour faire de l'ingénierie du chaos native du cloud. Litmus fournit des outils pour orchestrer le chaos sur Kubernetes afin d'aider les SRE à trouver des faiblesses dans leurs déploiements. Les SRE utilisent Litmus pour exécuter des expériences de chaos initialement dans l'environnement de  préparation et finalement en production pour trouver des bogues, des vulnérabilités. La correction des faiblesses conduit à une résilience accrue du système.

Litmus adopte une approche cloud native pour créer, gérer et surveiller le chaos. Le chaos est orchestré à l'aide des définitions de ressources personnalisées Kubernetes suivantes (**CRDs**):

- **ChaosEngine**: Une ressource pour lier une application Kubernetes ou un nœud Kubernetes à un ChaosExperiment. ChaosEngine est surveillé par l'opérateur du                      chaos de Litmus qui invoque ensuite des expériences de chaos.
- **ChaosExperiment**:Une ressource pour regrouper les paramètres de configuration d'une expérience de chaos. Les CR ChaosExperiment sont créés par l'opérateur                         lorsque les expériences sont appelées par ChaosEngine.
- **ChaosResult**: Une ressource pour contenir les résultats d'une expérience de chaos. L'exportateur Chaos lit les résultats et exporte les métriques dans un                      serveur Prometheus configuré.

Les expériences de chaos sont hébergées sur <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. Il s'agit d'un hub central où les développeurs ou fournisseurs d'applications partagent leurs expériences de chaos afin que leurs utilisateurs puissent les utiliser pour augmenter la résilience des applications en production.

![Flux de travail décisif](/images/litmus-arch_1.png)

## Cas d'utilisation

- **Pour les développeurs**: pour exécuter des expériences de chaos pendant le développement d'applications en tant qu'extension des tests unitaires ou des tests                              d'intégration.
- **Pour les constructeurs de pipelines CI**: Pour exécuter le chaos en tant qu'étape de pipeline pour trouver des bogues lorsque l'application est soumise à des                                               chemins de défaillance dans un pipeline.
- **Pour les SRE**: pour planifier et programmer des expériences de chaos dans l'application et / ou l'infrastructure environnante. Cette pratique identifie les                     faiblesses du système et augmente la résilience.

## Premiers pas avec Litmus

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Vérifiez <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">Litmus Docs</a> to get started.

## Contribuer au Chaos Hub

Vérifiez  <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Contribuer aux Guildelines pour le Chaos Hub</a>

## Adopteurs

 <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Adopteurs de LitmusChaos</a>

_Envoyez un PR à la page ci-dessus si vous utilisez Litmus dans votre pratique d'ingénierie du chaos_

## Choses à considérer

Certaines des considérations qui doivent être prises avec Litmus (en tant que cadre de chaos) sont énumérées ici. Beaucoup d'entre eux sont déjà en cours d'élaboration comme mentionné dans la [ROADMAP](./ROADMAP.md). Pour obtenir des détails ou des limitations concernant des tests spécifiques, reportez-vous aux [documents relatifs aux tests](https://docs.litmuschaos.io/docs/pod-delete/).

- Litmus chaos operator and the chaos experiments run as kubernetes resources in the cluster. In case of airgapped environments, the chaos custom resources
  and images need to be hosted on premise.
- When attempting to execute platform specific chaos experiments (like those on AWS, GCP cloud) the access details are passed via kubernetes secrets. Support
  for other modes of secret management with Litmus is yet to be tested/implemented.
- Some chaos experiments make use of the docker api from within the experiment pods, and thereby require the docker socket to be mounted. User discretion is
  advised when allowing developers/devops admins/SREs access for running these experiments.
- In (rare) cases where chaos experiments make use of privileged containers, the recommended security policies will be documented.

## Licence

Litmus est concédé sous licence Apache, version 2.0. Voir [LICENCE](./LICENSE) pour le texte complet de la licence. Certains des projets utilisés par le projet Litmus peuvent être régis par une licence différente, veuillez vous référer à sa licence spécifique.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos fait partie des projets CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Communauté

La communauté Litmus se réunit le troisième mercredi de chaque mois à 22h00 IST / 9h30 PST.

Ressources communautaires:

- [Community Slack](https://slack.litmuschaos.io)
- [Sync Up Meeting Link](https://zoom.us/j/91358162694)
- [Sync Up Agenda & Meeting Notes](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Youtube Channel (demos, meeting recordings, virtual meetups)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Liens importants
<a href="https://docs.litmuschaos.io">
  Litmus Docs <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  Paysage CNCF <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
