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

## Visión de conjunto

Litmus es un conjunto de herramientas para realizar ingeniería de caos nativa de la nube. Litmus proporciona herramientas para orquestar el caos en Kubernetes para ayudar a los SRE a encontrar debilidades en sus implementaciones. Los SRE utilizan Litmus para ejecutar experimentos de caos inicialmente en el entorno de ensayo y, finalmente, en producción para encontrar errores y vulnerabilidades. La reparación de las debilidades conduce a una mayor resistencia del sistema.

Litmus adopta un enfoque nativo de la nube para crear, administrar y monitorear el caos. El caos se organiza mediante las siguientes definiciones de recursos personalizados de Kubernetes (**CRDs**):

- **ChaosEngine**: Un recurso para vincular una aplicación de Kubernetes o un nodo de Kubernetes a un experimento de caos. Chaos Engine es observado por el Chaos-Operator de Litmus, que luego invoca los Chaos-Experiments.
- **ChaosExperiment**: Un recurso para agrupar los parámetros de configuración de un experimento de caos. El operador crea los IC de Experimento de Caos cuando Chaos Engine invoca los experimentos.
- **ChaosResult**: Un recurso para contener los resultados de un experimento de caos. El Chaos-exporter lee los resultados y exporta las métricas a un servidor Prometheus configurado.

Los experimentos de caos están alojados en <a href="https://hub.litmuschaos.io" target="_blank"> hub.litmuschaos.io </a>. Es un eje central donde los desarrolladores o proveedores de aplicaciones comparten sus experimentos de caos para que sus usuarios puedan usarlos para aumentar la resiliencia de las aplicaciones en producción.

![Litmus workflow](/images/litmus-arch_1.png)

## Casos de uso

- **Para desarrolladores**: Para ejecutar experimentos de caos durante el desarrollo de aplicaciones como una extensión de las pruebas unitarias o de integración.
- **Para constructoras de tuberías de CI**: Ejecutar el caos como una etapa de canalización para encontrar errores cuando la aplicación está sujeta a rutas fallidas en una canalización.
- **Para las SRE**: Planificar y programar experimentos de caos en la aplicación y / o la infraestructura circundante. Esta práctica identifica las debilidades del sistema y aumenta la resiliencia.

## Empezando con Litmus

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Consulte los <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank"> Litmus Docs </a> para comenzar.

## Contribuyendo a Chaos Hub

Consulte las <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank"> Pautas de contribución para el Chaos Hub </a>

## Adoptadoras

Echa un vistazo a los <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank"> Adopdores de LitmusChaos </a>

(_Envíe un PR a la página anterior si está utilizando Litmus en su práctica de ingeniería del caos_)

## Cosas para considerar

Algunas de las consideraciones que deben hacerse con Litmus (como un marco de caos) se enumeran ampliamente aquí. Muchos de estos ya se están trabajando en
como se menciona en [ROADMAP] (./ ROADMAP.md). Para obtener detalles o limitaciones sobre experimentos específicos, consulte los [documentos de experimentos] respectivos (https://docs.litmuschaos.io/docs/pod-delete/).

- El operador de caos de tornasol y los experimentos de caos se ejecutan como recursos de kubernetes en el clúster. En caso de entornos con espacio de aire, los recursos personalizados del caos y las imágenes deben alojarse en las instalaciones.
- Al intentar ejecutar experimentos de caos específicos de la plataforma (como los de AWS, la nube de GCP), los detalles de acceso se pasan a través de los secretos de Kubernetes. Apoyo para otros modos de gestión secreta con Litmus aún no se ha probado / implementado.
- Algunos experimentos de caos hacen uso de la API de la ventana acoplable desde dentro de los módulos de experimentos y, por lo tanto, requieren que se monte el conector de la ventana acoplable. La discreción del usuario es se recomienda al permitir el acceso de desarrolladores / administradores de devops / SRE para ejecutar estos experimentos.
- En casos (raros) en los que los experimentos de caos hacen uso de contenedores privilegiados, se documentarán las políticas de seguridad recomendadas.

## Licencia

Litmus tiene licencia de Apache License, Versión 2.0. Consulte [LICENCIA] (./ LICENCIA) para obtener el texto completo de la licencia. Algunos de los proyectos utilizados por el proyecto Litmus pueden estar regidos por una licencia diferente, consulte su licencia específica.

[![Estado FOSSA](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos es parte de los Proyectos de CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Comunidad

La comunidad de Litmus se reúne el tercer miércoles de cada mes a las 10:00 PM IST / 9:30 AM PST.

Recursos de la comunidad:

- [Comunidad Slack](https://slack.litmuschaos.io)
- [Sincronizar enlace de reunión](https://zoom.us/j/91358162694)
- [Sincronizar la agenda y las notas de la reunión](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Canal de Youtube (demostraciones, grabaciones de reuniones, reuniones virtuales)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Links importantes

<a href="https://docs.litmuschaos.io">
  Litmus Docs <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
