<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus
## Cloud-Native Chaos Engineering

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

#### *Leer en [otros idiomas](translations/TRANSLATIONS.md)*

[🇰🇷](translations/README-ko.md) [🇨🇳](translations/README-chn.md)

## Resumen

Litmus es un conjundo de herramientas para hacer [Chaos Engineering](https://en.wikipedia.org/wiki/Chaos_engineering) en la nube. Litmus proporciona herramientas para orquestar Experiemntos Chaos en Kuberntes con la finaldad de ayudar a la [SRE](https://en.wikipedia.org/wiki/Site_Reliability_Engineering) a encontrar debilidades en los despliegues. Inicialmente, la SRE usa a Litmus para correr Experimentos Chaos en entornos de prueba y, ocasionalmente, en entornos de producción para encontrar bugs o vulnerabilidades. Solventar las debilidades conduce a incrementar la resiliencia del sistema.

Litmus parte de un enfoque centrado en la nube  para crear, administar y monitorizar Chaos. Éste se orquestra usando la siguiente Definición de Recursos Personalizados de Kuberntes (**CRDs**):

  - **ChaosEngine**: Un recurso que relaciona una aplicación de Kubernetes o un nodo de Kubernets a un Experimento Chaos. Este recurso es observado por el Operador Chao de Litmus, que invoca los Experimentos Chaos.
  - **ChaosExperiment**: Un recurso para agrupar los parámetros de configuración de un Experimento Chaos. Estos expirementos son creados por el operador cuando son invocados por la ChaosEngine.
  - **ChaosResult**: Un recurso que contiene los resultados del Experimento Chaos. El Exportador Chaos lee los resultados y exporta las métricas a un servidor Prometheus previamente configurado.


Los Experimentos Chaos están alojados en <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. Es un hub centralizado en el que los desarrolladores o proveedores de la aplicación pueden mostrar sus Experimentos Chaos de manera que 
sus usuarios puedan utilizarlos para incrementar la resiliencia de la aplicación en producción.

![Litmus workflow](/images/litmus-arch_1.png)

## Casos de uso

  - **Para desarrolladores**: Correr Experimentos Chaos durante el desarrollo de la aplicación como extensión de los test unitarios o de los test de integración.
  - **Para constructores de pipelines de CI**: Correr Expirementos Chaos como una fase de la pipeline para encontrar bugs cuando se somete a la aplicación a rutas de fallo en la pipeline.
  - **Para SRE**: Planificar y programar Experimentos Chaos en la aplicación o en la infraestructura. Esta práctica identifica las debilidades en el sistema e incrementa su resiliencia.

## Empezando con Litmus

[![IMAGE ALT TEXT](../images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Revisa la  <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank"> documenación de Litmus </a> para empezar.

## Contribuir al Hub de Chaos 

Revisa la <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">
Guía para contribuir al Hub de Chaos </a>.

## Adoptadores

Revisa los <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Adoptadores de LitmusChaos</a>

(*Envía una PR a la página de arriba si estás usando Litmus en tu práctica de Chaos Engineering*)

## Consideraciones que tener en cuenta

A continuación se enumeran algunas consideraciones que se deben tener en cuenta sobre Litmus como framework de Chaos. Muchas de ellas ya están siendo trabajadas como se menciona en [ROADMAP](./ROADMAP.md). Para detalles o limitaciones sobre experimentos específicos, 
se debe consultar la [documentación de los experimentos](https://docs.litmuschaos.io/docs/pod-delete/) respectiva.

  - El Operador Chaos Litmus y los Experimentos Chaos corren como recursos de Kubernetes en un clúster. En caso de entornos airgapeados los recursos Chaos personalizaos y las imágenes debe ser alojados en local.
  - Cuando se intenta ejecutar Experimentos Chaos en una plataforma concreta (como AWS o el cloud de GCP) los detalles de acceso se pasan como secretos de Kubernetes. El soporte para otros modos de gestión secreta aún no se han testeado o implementado.
  - Algunos Experimentos Chaos hacen uso de la api de docker desde el interior del experimento, por lo que requieren el socket de docker para montarse. Se recomienda permitir el acceso a desarrolladores, devops y SRE para correr estos experimentos.
  - En casos (raros) en que los Experimentos Chaos hacen uso de contenedores privilegiados, se documentarán las políticas de seguridad recomendadas.

## Licencia

Litmos está licenciado bajo la Licencia Apache, versión 2.0. Ver el texto completo en [LICENCIA](./LICENSE). Algunos proyectos usados por Litmus pueden estar sometidos a  una licencia diferente, consulte su lecencia específica.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos forma parte de los projectos CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Communidad

La comunidad Litmus se reúne el tercer miércoles de cada mes a las 10:00 p.m. hora estándar de la India (IST) / 9:30 a.m. hora estándar del Pacífico (PST).

Recursos de la comunidad:

  - [Comunidad de Slack](https://slack.litmuschaos.io)
  - [Zoom](https://zoom.us/j/91358162694)
  - [HackMD (agenda y notas de meetings)](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
  - [Canal de Youtube (demos, gravaciones de meetings, meetups virtuales)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
  - [Tracker de releases](https://github.com/litmuschaos/litmus/milestones)

## Enlaces importantes

<a href="https://docs.litmuschaos.io">
  Documentación de Litmus <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
