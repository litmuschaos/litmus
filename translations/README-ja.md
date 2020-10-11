<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# Litmus
### クラウドネイティブ・カオスエンジニアリング

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

#### *他の言語は[ここを参照してください。](translations/TRANSLATIONS.md).*

[🇰🇷](translations/README-ko.md) [🇨🇳](translations/README-chn.md)

## 概要

Litmusはクラウドネイティブのカオスエンジニアリングを行うためのツールセットです。Litmusは、Kubernetes上でカオスオーケストレーションするためのツールを提供し、SREがデプロイした環境の脆弱性を発見するのを支援します。SREはLitmusを使用して、最初はステージング環境でカオスエクスペリメントを実行し、最終的には本番環境でバグや脆弱性を発見するのに利用します。弱点を修正することで、システムの回復力を高めることを目指します。

Litmusはクラウドネイティブなアプローチで、カオスの生成、管理、監視を行います。カオスは、以下のKubernetesカスタムリソース定義を使用してオーケストレーションされます。 (**CRDs**):

- **ChaosEngine**: KubernetesアプリケーションやKubernetesノードをChaosExperimentにリンクするためのリソースです。ChaosEngine は Litmus の Chaos-Operator によって監視され、次にChaos-Experimentsを実行します。
- **ChaosExperiment**: カオス実験の設定パラメータをグループ化するためのリソースです。ChaosExperiment CRはChaosEngineによってエクスペリメントが起動されたときにオペレータによって作成されます。
- **ChaosResult**: カオスエクスペリメントの結果を保持するリソース。Chaos-exporter は結果を読み込み、設定された Prometheus サーバにメトリクスをエクスポートします。

カオスエクスペリメントは <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a> でホストされています。これはアプリケーション開発者やベンダーがカオスエクスペリメントを共有するハブであり、ユーザーが、運用中のアプリケーションの耐障害性を向上させるために使用します。

![Litmus ワークフロー](/images/litmus-arch_1.png)

## ユースケース

- **開発者向け**: ユニットテストや統合テストの延長線上で、アプリケーション開発中にカオスエクスペリメントを行う。
- **CIパイプライン作成者**: パイプラインの段階でアプリケーションが失敗するパスが存在する場合、そのバグを見つけるためにパイプラインの一部としてカオスを実行する。
- **SRE向け**: アプリケーション、および周囲のインフラストラクチャに対するカオスエクスペリメントを計画し、スケジュールを立てる。これによりシステムの弱点を特定し、回復力を高める。

## Litmusを始める

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

始めるには <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">Litmusドキュメンテーション</a>を参照ください。。

## Chaos Hubへの貢献

<a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">Chaos Hubに貢献するためのガイドライン</a>を参照ください。

## アダプター

<a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">LitmusChaosのアダプター</a>を参照ください。

(_カオスエンジニアリングのための実際にLitmusを使用している場合は、上記のページにPRを送信してください。_)

## 考慮すべき事項

Litmus（カオスフレームワークとして）で行う必要がある考慮すべき事項のいくつかは、ここに大まかにリストアップされています。これらの多くは、[ロードマップ](./ROADMAP.md)で述べられているように、すでに作業が行われています。特定のエクスペリメントに関する詳細や制限については、それぞれの[エクスペリメントドキュメント](https://docs.litmuschaos.io/docs/pod-delete/)を参照してください。

- Docker以外のコンテナランタイム（containerd, CRI-O）のネットワークカオスは[1.8.0](https://github.com/litmuschaos/litmus/releases/tag/1.8.0)からサポートされています。
- Litmusのカオスオペレーターとカオスエクスペリメントはクラスタ内のkubernetesリソースとして動作します。インターネットから隔離された環境の場合、カオスカスタムリソースとイメージをオンプレミスでホストする必要があります。
- プラットフォーム固有のカオスエクスペリメント(AWSやGCPクラウド上でのエクスペリメントなど)を実行しようとすると、アクセスの詳細はkubernetesのシークレットを介して渡されます。他のシークレット管理のモードのサポートはまだテスト/実装段階です。
- カオスエクスペリメントの中には、エクスペリメントポッド内からDocker APIを利用しているものもあり、その場合はDockerソケットをマウントする必要があります。これらのエクスペリメントを実行するために、開発者/DevOps管理者/SRE のアクセスを許可するかどうかは、ユーザーに助言するようにします。
- カオスエスクペリメントで特権コンテナを利用する(まれな)場合 はセキュリティポリシーを文書化することを推奨します。

## ライセンス

Litmus は Apache License, Version 2.0 の下でライセンスされています。ライセンスの全文は[ライセンス](./LICENSE)を参照してください。Litmusプロジェクトで使用されているプロジェクトの中には、別のライセンスで管理されているものもありますので、そのライセンスを参照してください。

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

Litmus Chaos はCNCFプロジェクトの一部です。

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## コミュニティ

Litmusコミュニティミーティングは毎月第3水曜日の10:00PM IST/9.30AM PSTに開催されます。

コミュニティリソース:

- [コミュニティSlack](https://slack.litmuschaos.io)
- [共有ミーティングのリンク](https://zoom.us/j/91358162694)
- [共有ミーティングのアジェンダと議事録](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [Youtube チャンネル (デモ、ミーティング録画、オンラインミーティング)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [Release Tracker](https://github.com/litmuschaos/litmus/milestones)

## Important Links

<a href="https://docs.litmuschaos.io">
  Litmus ドキュメント <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
