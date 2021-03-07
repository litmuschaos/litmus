<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus
### Облачный хаос инжиниринг

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

#### *Back to [English](https://github.com/litmuschaos/litmus/blob/master/README.md).*


## Обзор

Litmus - это набор инструментов для облачного хаос-инжиниринга. Litmus предоставляет возможность оркестрации хаоса в Kubernetes и упрощает поиск уязвимостей, которые могут возникнуть в процессе деплоя. Разработчики используют Litmus для запуска хаос-экспериментов сначала в стейджинг окружениях, а затем и в продакшене для поиска багов и уязвимостей. Устранение слабых мест системы повышает её стабильность.

Litmus соблюдает облачный подход в создании, поддержке и контроле хаоса. Для оркестрации хаоса используются кастомные ресурсы, так называемые Kubernetes Custom Resource Definitions (**CRDs**):

- **ChaosEngine**: Ресурс для связи приложения или ноды Kubernetes с ChaosExperiment. ChaosEngine отслеживается  Chaos-Operator, который вызывает ChaosExperiments.
- **ChaosExperiment**: Ресурс для объединения параметров конфигурации хаос эксперимента. Запросы на изменение ChaosExperiment создаются оператором, когда эксперимент вызывается ChaosEngine.
- **ChaosResult**: Ресурс для хранения результатов хаотического эксперимента. Chaos-exporter считывает результаты и экспортирует метрики в Prometheus через ServiceMonitor.

Хаос эксперименты находятся на <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. Это централизованный репозиторий, где разработчики приложений или вендоры делятся своими хаос экспериментами, чтобы пользователи могли их применять для улучшения стабильности приложений в продакшн.

![Litmus workflow](/images/litmus-arch_1.png)

## Применение

- **Для разработчиков**: Для запуска хаос экспериментов в процессе разработки приложений в дополнение к юнит-тестам или интеграционному тестированию.
- **Для CI пайплайнов**: Для запуска хаоса в качестве стадии в пайплайне с целью поиска багов в случае падения приложения.
- **Для SREs**: Для планирования запуска хаос экспериментов в приложении и/или окружении. Это позволяет выявить слабые места системы и повышает её стабильность.

## Начало Работы с Litmus

[![IMAGE ALT TEXT](../images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

Ознакомьтесь с документацией <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">Litmus Docs</a> для начала работы.
## Вклад в Chaos Hub

Ознакомьтесь с <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank"> Документацией для Контрибьюторов в Chaos Hub</a>

## Пользователи

Ознакомьтесь со <a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">Списком компаний, использующих LitmusChaos</a>

(_ Вы можете отправить PR к вышеуказанной странице, если Вы используете Litmus в своей практике хаос-инжиниринга_)

## Необходимо знать перед внедрением

Моменты требующие особого внимания при работе с Litmus (как фреймворком для хаоса), подробно перечислены ниже. Над многими из них уже ведется работа, как было упомянуто в [ROADMAP](../ROADMAP.md). Для ознакомления с деталями или ограничениями в конкретных экспериментах обращайтесь к [experiments docs](https://docs.litmuschaos.io/docs/pod-delete/).

- Оператор хаоса Litmus и хаос эксперименты запускаются как ресурсы Kubernetes в кластере. Поэтому кастомные ресурсы и изображения должны быть размещены on-prem и доступны для скачивания в момент установки.
- При попытке выполнения хаос экспериментов, специфичных для определнных провайдеров (например, AWS, GCP и др.), подробности запроса передаются посредством секретов Kubernetes. Поддержка других способов управления секретами в Litmus на данный момент в стадии имлементации/тестирования.
- Некоторые хаос эксперименты используют docker api внутри  подов с экспериментами, и в связи с этим требуют установки сокета Docker. Рекомендуется соблюдать осторожность при открытии доступа разработчикам /devops администраторам /SRE к запуску этих экспериментов.
- В редких случаях, когда хаос эксперименты используют привилегированные контейнеры, рекомендуемые политики безопасности будут задокументированы.

## Лицензия

Litmus находится под Apache License, Version 2.0. Полный текст лицензии по ссылке [LICENSE](../LICENSE). Некоторые проекты, используемые Litmus, могут находиться под другой лицензией, в таком случае обращайтесь к ней.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos является частью проектов CNCF.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## Комьюнити

Комьюнити Litmus проводит встречи каждую третью среду месяца в 22:00 IST.

Ресурсы:

- [Slack](https://slack.litmuschaos.io)
- [Информационные Встречи](https://zoom.us/j/91358162694)
- [Расписание и Записи Встреч](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Youtube Канал (демо, записи со встреч, онлайн-собрания)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Информация о Релизах](https://github.com/litmuschaos/litmus/milestones)

## Важные Ссылки

<a href="https://docs.litmuschaos.io">
  Документация Litmus <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
