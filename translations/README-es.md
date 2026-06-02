<img alt="LitmusChaos" src="https://avatars.githubusercontent.com/u/49853472?s=200&v=4" width="200" align="left">

# Litmus
## Cloud-Native Chaos Engineering

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

#### *Leer en [otros idiomas](./TRANSLATIONS.md)*

[🇨🇳](README-chn.md) [🇬🇧](../README.md) [🇪🇸](README-es.md) [🇫🇷](README-fr.md) [🇩🇪](README-de.md) [🇮🇳](README-hi.md) [🇯🇵](README-ja.md) [🇰🇷](README-ko.md) [🇧🇷](README-pt-br.md) [🇷🇺](README-ru.md)

## Descripción general

LitmusChaos es una plataforma de código abierto de Ingeniería del Caos que permite a los equipos identificar debilidades y posibles interrupciones en las infraestructuras mediante la inducción de pruebas de caos de forma controlada. Desarrolladores y SRE pueden practicar la Ingeniería del Caos con LitmusChaos, ya que es fácil de usar, se basa en principios modernos de Ingeniería del Caos y cuenta con la colaboración de la comunidad. Es 100% de código abierto y un proyecto CNCF.

Litmus parte de un enfoque centrado en la nube  para crear, administrar y monitorear experimentos de caos. Éste se orquesta usando la siguiente Definición de Recursos Personalizados de Kubernetes.

  - **Plano de Control Caos**: Una herramienta centralizada de gestión del caos llamada chaos-center, que ayuda a construir, programar y visualizar los flujos de trabajo del caos de Litmus.

  - **Servicios del plano de ejecución del caos**: Está compuesto por un agente de caos y múltiples operadores que ejecutan y supervisan el experimento dentro de un entorno de Kubernetes objetivo definido.

![architecture summary](/images/litmus-control-and-execution-plane-overview.png)

El nucleo de la plataforma se encuentran los siguientes recursos personalizados del caos:

- **Experimento del caos**: Un recurso para agrupar los parámetros de configuración de una falla específica. Los CRs de ChaosExperiment son básicamente plantillas instalables que describen la biblioteca que ejecuta la falla, indican los permisos necesarios para ejecutarla y los valores predeterminados con los que funcionará. A través de ChaosExperiment, Litmus admite BYOC (bring-your-own-chaos), lo que facilita la integración (opcional) de herramientas de terceros para realizar la inyección de fallas.

- **Chaos Engine**: Un recurso para vincular una carga de trabajo/servicio, un nodo o un componente de infraestructura de una aplicación Kubernetes a una falla descrita por ChaosExperiment.
También proporciona opciones para ajustar las propiedades de ejecución y especificar las restricciones de validación de estado estable mediante "sondas". ChaosEngine es supervisado por Chaos-Operator, que lo reconcilia (activa la ejecución del experimento) mediante ejecutores.

- **Resultado Chaos**: Un recurso para almacenar los resultados de la ejecución del experimento. Proporciona detalles sobre el éxito de cada restricción de validación, el estado de reversión del fallo y un veredicto. El exportador de Chaos lee los resultados y expone la información como métricas de Prometheus.
Los resultados de Chaos son especialmente útiles durante las ejecuciones automatizadas.

Los Experimentos Chaos están alojados en <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. Es un hub centralizado en el que los desarrolladores o proveedores de la aplicación pueden mostrar sus Experimentos Chaos de manera que 
sus usuarios puedan utilizarlos para incrementar la resiliencia de la aplicación en producción.

## Casos de uso

  - **Para desarrolladores**: Correr Experimentos Chaos durante el desarrollo de la aplicación como extensión de los test unitarios o de los test de integración.
  - **Construcción y deploy CI/CD pipelines**: Correr Experimentos Chaos como una fase de la pipeline para encontrar bugs cuando se somete a la aplicación a rutas de fallo en la pipeline.
  - **Para SRE**: Planificar y programar Experimentos Chaos en la aplicación o en la infraestructura. Esta práctica identifica las debilidades en el sistema e incrementa su resiliencia.

## Empezando con Litmus

Para comenzar, consulte la <a href="https://docs.litmuschaos.io/docs/introduction/what-is-litmus" target="_blank">Litmus Docs</a> y en específico la <a href="https://docs.litmuschaos.io/docs/getting-started/installation#prerequisites" target="_blank">sección de instalación</a> de  <a href="https://docs.litmuschaos.io/docs/getting-started/installation" target="_blank">Iniciar con Litmus</a> page.

## Contribuir al Hub de Chaos 

Revisa la  <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Guía para contribuir al Hub de Chaos </a>.

## Adoptadores

Revisa los <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Adoptadores de LitmusChaos</a>

(*Envía una PR a la página de arriba si estás usando Litmus en tu práctica de Chaos Engineering*)

## Consideraciones que tener en cuenta

A continuación se enumeran algunas consideraciones que se deben tener en cuenta sobre Litmus como framework de Chaos. Muchas de ellas ya están siendo trabajadas como se menciona en [ROADMAP](../ROADMAP.md). Para detalles o limitaciones sobre experimentos específicos, 
se debe consultar la [documentación de los experimentos](https://docs.litmuschaos.io/docs/pod-delete/) respectiva.

  - El Operador Chaos Litmus y los Experimentos Chaos corren como recursos de Kubernetes en un clúster. En caso de entornos air-gapped los recursos Chaos personalizados y las imágenes deben ser alojados en local.
  - Cuando se intenta ejecutar Experimentos Chaos en una plataforma concreta (como AWS o el cloud de GCP) los detalles de acceso se pasan como secretos de Kubernetes. El soporte para otros modos de gestión secreta aún no se han testeado o implementado.
  - Algunos Experimentos Chaos hacen uso de la api de docker desde el interior del experimento, por lo que requieren el socket de docker para montarse. Se recomienda permitir el acceso a desarrolladores, devops y SRE para correr estos experimentos.
  - En casos (raros) en que los Experimentos Chaos hacen uso de contenedores privilegiados, se documentarán las políticas de seguridad recomendadas.

## Licencia

Litmus está licenciado bajo la Licencia Apache, versión 2.0. Ver el texto completo en [LICENCIA](../LICENSE). Algunos proyectos usados por Litmus pueden estar sometidos a  una licencia diferente, consulte su licencia específica.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos forma parte de los proyectos CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/main/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/?selected=litmus)

## Comunidad

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
<a href="https://landscape.cncf.io/?selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/cncf-landscape-horizontal-color.svg" alt="Litmus on CNCF Landscape" height="15">
</a>

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
