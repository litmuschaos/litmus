<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus

### Engenharia do Caos Cloud-Native

[![Canal do Slack](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
[![CircleCI](https://circleci.com/gh/litmuschaos/litmus/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/litmuschaos/litmus)
[![Docker Pulls](https://img.shields.io/docker/pulls/litmuschaos/chaos-operator.svg)](https://hub.docker.com/r/litmuschaos/chaos-operator)
[![GitHub stars](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![Twitter Follow](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![Melhores Práticas CII](https://bestpractices.coreinfrastructure.org/projects/3202/badge)](https://bestpractices.coreinfrastructure.org/projects/3202)
[![Conformidade BCH](https://bettercodehub.com/edge/badge/litmuschaos/litmus?branch=master)](https://bettercodehub.com/)
[![Status FOSSA](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![Canal YouTube](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br><br><br>

#### *Leia esse README em [outras linguas](./TRANSLATIONS.md).*


## Visão geral

Litmus é um conjunto de ferramentas para fazer engenharia do caos cloud-native. Litmus provê ferramentas para criar caos em Kubernetes para ajudar SREs a encontrar fraquezas nas suas publicações (deploys). SREs utilizam Litmus para rodar experimentos de caos inicialmente nos ambientes de homologação e eventualmente em produção para encontrar bugs e vulnerabilidades. Consertar essas fraquezas aumenta a resiliência do sistema.

Litmus utiliza uma abordagem cloud-native para criar, gerenciar e monitorar o caos. O caos é orquestrado utilizando os seguintes Kubernetes CRDs (Custom Resource Definitions):

- **ChaosEngine**: Um recurso para conectar uma aplicação ou um nodo Kubernetes a um ChaosExperiment. ChaosEngine é monitorado pelo Litmus Chaos-Operator que então invoca os Chaos-Experiments.
- **ChaosExperiment**: Um recurso para agrupar os parâmetros de configuração de um experimente de caos. Recursos ChaosExperiment são criados pelo operador quando experimentos são invocados pelo ChaosEngine.
- **ChaosResult**: Um recurso para armazenar os resultados de um experimento de caos. O Chaos-exporter lê os resultados e exporta as métricas para um servidor Prometheus configurado.

Experimentos Chaos são hospedados/armazenados em <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. É um bug central onde os desenvolvedores da aplicação compartilham seus experimentos de caos para que seus usuário possam então utilizá-los para aumentar a resiliência de suas aplicações em produção.

![Workflow Litmus](/images/litmus-arch_1.png)

## Casos de Uso

- **Para Desenvolvedores**: Para utilizar experimentos de caos durante o desenvolvimento da aplicação como um extensão de testes de integração ou unitários.
- **Para engenheiros de pipelines de integração contínua (CI)**: Para utilizar os experimentos de caos como um estágio do pipeline para encontrar bugs quando a aplicação está sujeita a encontrar caminhos de falha durante o pipeline.
- **Para SREs**: Para planejar e agendar experimentos de caos em uma aplicação e/ou sua infraestrutura. Essa prática identifica as fraquezas no sistema e aumenta sua resiliência.

## Começando com Litmus

[![ALT TEXT](../images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Acesse os <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">docs do Litmus Docs</a> para aprender como começar.

## Contribuindo para o Chaos Hub

Confira <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">o Guia para Contribuição para o Chaos Hub</a>

## Adotantes

Confira <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">quem está utilizando o Litmus Chaos</a>

(_Crie um PR para a página acima se você está utilizando Litmus nas suas práticas de engenharia de caos_)

## Coisas a se considerar

Algumasdas considerações que precisam ser feitas com o Litmus (como um framework de caos), são amplamente listadas aqui. Vários desses já estão sendo trabalhados como mencionado no [ROADMAP](../ROADMAP.md). Para detalhes ou limitações acerca de experimentos específicos, confira a respectivo [documentação do experimento](https://docs.litmuschaos.io/docs/pod-delete/)

- O operador de caos litmus e os seus experimentos rodam como recursos Kubernetes em um cluster. Em casos de ambientes abertos, os recursos próprios e as imagens precisam ser armazenados on premise.
- Quando tentando utilizar experimentos específicos para uma plataforma (como aqueles para AWS, GCP cloud) os detalhes de acesso são passados através de Kubernetes secrets. Suporte para outros modos de gerenciamento de credenciais com o Litmus ainda está para ser testado/implementado.
- ALguns experimos de caos fazem uso da Docker API de dentro dos pods de eperimento, e portanto precisando que o socket do Docker esteja montado. A discrição do usuário é recomendada ao permitir que desenvolvedores/admins devops/SREs acessem/executem esses experimentos.
- Em casos (raros) onde experimentos de caos fazem uso de containers privilegiados, as políticas de segurança recomendadas serão documentadas.

## Licensa

Litmus é licenciado através da Apache License, Version 2.0. Veja [LICENSE](../LICENSE) para o texto completo da licensa. Alguns dos projetos utilizados pelo projeto Litmus podem ter uma licença diferente, então, nesses casos, refira-se a cada licensa específica.

[![Status FOSSA](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos faz parte dos projetos CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Comunidade

A comunidade Litmus se encontra na terceira quarta-feira de todo mês, as 10:00PM IST/9.30 AM PST/

The Litmus community meets on the third wednesday of every month at 10:00PM IST/9.30 AM PST/1:30 PM Brasilia.

Recursos da comunidade:

- [Slack da Comunidade](https://slack.litmuschaos.io)
- [Link para a reunião de Alinhamento](https://zoom.us/j/91358162694)
- [Agenda e Notas da Reunião de alinhamento](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Canal do Youtube (demos, gravações das reuniões, encontros virtuais)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Links importantes

<a href="https://docs.litmuschaos.io">
  Documentação do Litmus <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
