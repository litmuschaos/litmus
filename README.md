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

## visão global

Litmus é um conjunto de ferramentas para fazer engenharia do caos nativa da nuvem. O Litmus fornece ferramentas para orquestrar o caos no Kubernetes para ajudar os SREs a encontrar pontos fracos em suas implantações. SREs usam Litmus para executar experimentos de caos inicialmente no ambiente de teste e, eventualmente, em produção para encontrar bugs e vulnerabilidades. Consertar os pontos fracos leva a uma maior resiliência do sistema.

O Litmus adota uma abordagem nativa da nuvem para criar, gerenciar e monitorar o caos. O caos é orquestrado usando as seguintes definições de recursos personalizados do Kubernetes (**CRDs**):

- **ChaosEngine**: Um recurso para vincular um aplicativo ou nó do Kubernetes a um experimento do caos. Chaos Engine é assistido pelo Chaos-Operator de Litmus, que então invoca Chaos-Experiments
- **ChaosExperiment**: Um recurso para agrupar os parâmetros de configuração de um experimento do caos. Os CIs de experimento do caos são criados pelo operador quando os experimentos são invocados pelo Chaos Engine.
- **ChaosResult**: Um recurso para conter os resultados de um experimento do caos. O exportador do Caos lê os resultados e exporta as métricas para um servidor Prometheus configurado.

Os experimentos do caos estão hospedados em <a href="https://hub.litmuschaos.io" target="_blank"> hub.litmuschaos.io </a>. É um hub central onde os desenvolvedores de aplicativos ou fornecedores compartilham seus experimentos de caos para que seus usuários possam usá-los para aumentar a resiliência dos aplicativos em produção.

![Litmus workflow](/images/litmus-arch_1.png)

## Casos de uso

- **Para desenvolvedores**: Para executar experimentos de caos durante o desenvolvimento de aplicativos como uma extensão de teste de unidade ou teste de integração.
- **Para construtor de pipeline de CIs**: Para executar o caos como um estágio de pipeline para encontrar bugs quando o aplicativo está sujeito a caminhos de falha em um pipeline.
- **Para SREs**: Para planejar e agendar experimentos de caos na aplicação e / ou infraestrutura circundante. Essa prática identifica os pontos fracos do sistema e aumenta a resiliência.

## Introdução ao Litmus

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Confira o <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank"> Litmus Docs </a> para começar.

## Contribuindo para Chaos Hub

Confira <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank"> Contribuindo com Guildelines para o Chaos Hub </a>

## Adotantes

Confira os <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank"> Adotadores de LitmusChaos </a>

(_Envie um PR para a página acima se você estiver usando o Litmus em suas práticas de engenharia do caos_)

## Coisas a considerar

Algumas das considerações que precisam ser feitas com Litmus (como uma estrutura de caos), estão amplamente listadas aqui. Muitos deles já estão sendo trabalhados
conforme mencionado no [ROADMAP] (./ ROADMAP.md). Para obter detalhes ou limitações sobre experimentos específicos, consulte os respectivos [documentos dos experimentos] (https://docs.litmuschaos.io/docs/pod-delete/).

- O operador Litmus chaos e os experimentos de caos são executados como recursos do kubernetes no cluster. No caso de ambientes sem ar, os recursos e imagens personalizados do caos precisam ser hospedados no local.
- Ao tentar executar experimentos de caos específicos da plataforma (como aqueles na AWS, nuvem GCP), os detalhes de acesso são passados ​​por meio de segredos do kubernetes. Apoio, suporte para outros modos de gerenciamento de segredo com Litmus ainda está para ser testado / implementado.
- Alguns experimentos de caos usam a API do docker de dentro dos pods de experimentos e, portanto, exigem que o soquete do docker seja montado. A discrição do usuário é
  aconselhado ao permitir o acesso de desenvolvedores / administradores de devops / SREs para executar esses experimentos.
- Em (raros) casos em que experimentos de caos fazem uso de contêineres privilegiados, as políticas de segurança recomendadas serão documentadas.

## Licença

Litmus é licenciado sob a Licença Apache, Versão 2.0. Veja [LICENÇA] (./ LICENÇA) para o texto completo da licença. Alguns dos projetos usados ​​pelo projeto Litmus podem ser regidos por uma licença diferente, consulte sua licença específica.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos faz parte dos Projetos CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Comunidade

A comunidade Litmus se reúne na terceira quarta-feira de cada mês às 22h IST / 9h30 PST.

Recursos comunitários:

- [Community Slack](https://slack.litmuschaos.io)
- [Sincronizar link da reunião](https://zoom.us/j/91358162694)
- [Sincronizar agenda e notas de reunião](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Canal do Youtube (demos, gravações de reuniões, encontros virtuais)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Links importantes

<a href="https://docs.litmuschaos.io">
  Litmus Docs <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
