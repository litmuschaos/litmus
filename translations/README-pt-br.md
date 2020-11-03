<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus
## Engenharia do Caos Cloud-Native

[![Canal no Slack](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
[![CircleCI](https://circleci.com/gh/litmuschaos/litmus/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/litmuschaos/litmus)
[![Docker Pulls](https://img.shields.io/docker/pulls/litmuschaos/chaos-operator.svg)](https://hub.docker.com/r/litmuschaos/chaos-operator)
[![Marcados com Estrela no GitHub](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![Issues no GitHub](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![Siga-nos no Twitter](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![Melhores Práticas CII](https://bestpractices.coreinfrastructure.org/projects/3202/badge)](https://bestpractices.coreinfrastructure.org/projects/3202)
[![BCH compliance](https://bettercodehub.com/edge/badge/litmuschaos/litmus?branch=master)](https://bettercodehub.com/)
[![Status do FOSSA](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![Canal no YouTube](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br><br><br>

#### *Leia em [outros idiomas](translations/TRANSLATIONS.md)*

[🇰🇷](translations/README-ko.md) [🇨🇳](translations/README-chn.md) [🇧🇷](translations/README-pt-br.md)

## Visão Geral

O Litmus é uma caixa de ferramentas para engenharia do caos Cloud-Native. O Litmus oferece as ferramentas necessárias para orquestrar o caos no Kubernetes e ajudar o SREs a encontrar falhas nos seus deploys. SREs usam o Litmus para rodar experimentos começando pelo ambiente de homologação e, eventualmente, em produção para encontrar bugs e vulnerabilidades. Corrigir as falhas leva o sistema ao aumento da sua resiliência.

O Litmus opera em uma abordagem cloud-native para criar, gerenciar e monitorar o caos. O caos é orquestrado usando as seguintes definições padrão de recursos do Kubernetes (**CRDs**):

  - **ChaosEngine**: Recurso para linkar uma aplicação Kubernetes ou um nodo Kubernetes a um ChaosExperiment. A ChaosEngine é monitorada pelo Litmus Chaos-Operator que então invoca os Chaos-Experiments.
  - **ChaosExperiment**: Recurso para agrupar a configuração de parâmetros de um chaos experiment. ChaosExperiment CR´s são criados pelo operadores quando os experimentos são invocados pelo ChaosEngine.
  - **ChaosResult**: Recurso para armazenar os resultados de um chaos-experiment. O Chaos-exporter lê os resultados e exporta as métricas para um servidor configurado no Prometheus.

Experimentos Chaos são hospedados em <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. Esse é um hub central onde os desenvolvedores ou vendedores irão partilhar seus experimentos chaos para que seus usuários possam usá-los e aumentar a resiliência das aplicações em produção.

![Fluxo de Trabalho do Litmus](/images/litmus-arch_1.png)

## Casos de Uso

  - **Para Desenvolvedores**: Para rodar experimentos chaos durante o desenvolvimento da aplicação como uma extensão de uma unidade de teste ou de uma testagem integrada.
  - **Para contrutores de CI pipelines**: Para rodar o chaos como um estágio pipeline para encontrar bugs quando a aplicação é sujeita a encontrar paths com falhas no mesmo.
  - **Para SREs**: Para planejar e agendar experimentos chaos dentro da aplicação e/ou na infraestrutura que a envolve. Essa prática intensifica as fraquezas no sistema e aumenta sua resiliência.

## Começando a Usar o Litmus

[![IMAGE ALT TEXT](../images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Confira <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">os Litmus Docs</a> para começar.

## Contribuindo para o Chaos Hub

Confira <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">as Diretrizes de Contribuição para o Chaos Hub</a>

## Utilizadores

Confira <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Utilizadores do LitmusChaos</a>

(*Envie uma PR para a página acima se você estiver usando o  Litmus nas suas práticas de engenharia do caos*)

## Para Levar em Consideração

Algumas considerações precisam ser feitas quanto ao Litmus (como um framework chaos), e elas estão amplamente listadas aqui. 
Muitas delas já estão sendo trabalhadas conforme mencionado no [ROADMAP](./ROADMAP.md). 
Para mais detalhes ou limitações encontradas em experimentos específicos, procure em [docs de experimentos](https://docs.litmuschaos.io/docs/pod-delete/).

  - O Litmus chaos operator e os experimentos chaos rodam como recursos do Kubernetes no cluster. 
  No caso de ambientes abertos, os recursos padrão do chaos e as imagens precisam ser hospedadas on premise.
  - Ao tentar executar experimentos chaos específicos de plataforma (como os da AWS, GCP cloud) os detalhes de acesso são passados via Kubernetes secrets. 
  O suporte do Litmus a outros modos de gerenciamento secret ainda estão para ser testados/implementados.
  - Alguns experimentos chaos usam a api do docker de dentro dos pods de experimento, exigindo, portanto, que o socket do docker esteja montado. 
  Recomenda-se discrição do usuário ao permitir que desenvolvedores/admins/devops/SREs acessem para executar esses experimentos. 
  
  - Em alguns casos (raros) onde os experimentos chaos utilizam containers com privilégios, as políticas de segurança recomendadas serão documentadas.

## Licença

O Litmus é licenciado pela Apache License, Versão 2.0. Veja em [LICENSE](./LICENSE) para o texto completo. Alguns dos projetos utilizados pelo Litmus podem ter outras licenças associadas, por favor, faça referência à licença apropriada a cada caso.

[![Status do FOSSA](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

O Litmus Chaos é parte dos projetos CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Comunidade

A comunidade Litmus se encontra na terceira quarta de cada mês às 10:00 da noite IST, 9.30 da manhã PST.

Recursos da comunidade:

 - [Slack da Comunidade](https://slack.litmuschaos.io)
 - [Alinhamento - Link para os Encontros](https://zoom.us/j/91358162694)
 - [Alinhamento - Agenda & Notas dos Encontros](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
 - [Canal no Youtube (demos, encontros gravados, meetups virtuais)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
 - [Tracker de Lançamentos](https://github.com/litmuschaos/litmus/milestones)

## Links Importantes

<a href="https://docs.litmuschaos.io">
  Docs Litmus <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus na CNCF Landscape" height="15">
</a>
