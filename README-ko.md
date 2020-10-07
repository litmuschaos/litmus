<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# 리트머스(Litmus)
### 클라우드 네이티브 카오스 엔지니어링

[![슬랙 채널](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
[![CircleCI](https://circleci.com/gh/litmuschaos/litmus/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/litmuschaos/litmus)
[![도커 풀](https://img.shields.io/docker/pulls/litmuschaos/chaos-operator.svg)](https://hub.docker.com/r/litmuschaos/chaos-operator)
[![GitHub 스타](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![GitHub 이슈](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![트위터 팔로우](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![CII 모범 사례](https://bestpractices.coreinfrastructure.org/projects/3202/badge)](https://bestpractices.coreinfrastructure.org/projects/3202)
[![BCH 컴플라이언스](https://bettercodehub.com/edge/badge/litmuschaos/litmus?branch=master)](https://bettercodehub.com/)
[![FOSSA 상태](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![유튜브 채널](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br><br><br>

## 개요

리트머스는 클라우드 네이티브 카오스(Chaos) 엔지니어링을 수행하기 위한 도구 세트입니다. 리트머스는 쿠버네티스에서 카오스를 조율하는 도구를 제공하여 SRE가 배포된 환경에서 약점을 찾을 수 있도록 지원합니다. SRE는 리트머스를 사용하여 초기에 스테이징 환경에서 카오스 실험을 실행하고 결국에는 프로덕션에서 버그와 취약점을 찾습니다. 약점을 수정하면 시스템의 회복 탄력성이 향상됩니다.

리트머스는 클라우드 네이티브 접근 방식을 사용하여 카오스를 생성, 관리 및 모니터링 합니다. 카오스는 다음의 쿠버네티스 커스텀 리소스 데피니션(**CRD**)을 사용하여 조정됩니다.

- **ChaosEngine**: 쿠버네티스 애플리케이션 또는 쿠버네티스 노드를 ChaosExperiment에 연결하는 리소스입니다. ChaosEngine은 리트머스의 카오스-오퍼레이터(Chaos-Operator)가 감시하고 카오스-실험(Chaos-Experiments)을 호출합니다.
- **ChaosExperiment**: 카오스 실험의 구성 파라미터를 그룹화하는 리소스입니다. ChaosExperiment CR은 ChaosEngine에서 실험을 호출할 때 오퍼레이터가 생성합니다.
- **ChaosResult**: 카오스 실험의 결과를 보관할 리소스입니다. 카오스-익스포터(Chaos-exporter)는 결과를 읽고 구성된 프로메테우스(Prometheus) 서버로 메트릭을 내보냅니다.

카오스 실험은 <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>에서 호스팅합니다. 이를 통해 사용자가 프로덕션 애플리케이션의 회복 탄력성을 높일 수 있도록 애플리케이션 개발자 또는 공급 업체가 카오스 실험을 공유하는 중앙 허브입니다.

![리트머스 워크플로우](/images/litmus-arch_1.png)

## 유스케이스

- **개발자를 위한 케이스**: 단위 테스트 또는 통합 테스트의 확장으로 애플리케이션 개발 중에 카오스 실험을 실행합니다.
- **CI 파이프라인 빌더를 위한 케이스**: 애플리케이션이 파이프라인에서 실패 경로에 노출될 때 버그를 찾기 위해 파이프라인 단계로 카오스를 실행합니다.
- **SRE를 위한 케이스**: 애플리케이션 및/또는 주변 인프라에 대한 카오스 실험을 계획하고 예약합니다. 이 방법은 시스템의 약점을 식별하고 회복 탄력성을 높입니다.

## 리트머스 시작하기

[![IMAGE ALT TEXT](images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

시작하려면 <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">리트머스 문서</a>를 확인해보세요.

## 카오스 허브에 기여하기

<a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">카오스 허브에 기여하기 위한 가이드라인</a>을 확인해보세요.

## 도입한 조직

<a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank">LitmusChaos를 도입한 조직</a>을 확인해보세요.

(_여러분의 카오스 엔지니어링 실습에서 리트머스를 사용하는 경우 위 페이지로 PR을 보내주세요_)

## 고려할 사항

아래는 여러 분야에 걸쳐 리트머스(카오스 프레임워크)에서 고려해야 할 몇 가지 사항들입니다. 이들 중 많은 부분이
이미 [로드맵](./ROADMAP.md)에 언급한대로 작업 중입니다. 특정 실험에 대한 자세한 내용이나 제한 사항은 각 [실험 문서](https://docs.litmuschaos.io/docs/pod-delete/)를 참고하면 됩니다.

- containerd, CRIO와 같은 도커 이외의 컨테이너 런타임에 대한 네트워크 카오스는 아직 지원되지 않습니다.
- 리트머스 카오스 오퍼레이터와 카오스 실험은 클러스터에서 쿠버네티스 리소스로 실행됩니다. 연결되지 않은 환경(airgapped environment)의 경우 카오스 사용자 정의 리소스와
  이미지를 온 프레미스로 호스팅해야 합니다.
- 플랫폼 별 카오스 실험(예: AWS, GCP 클라우드)을 실행하려고 할 때 접근 세부 정보가 쿠버네티스 시크릿을 통해 전달됩니다. 리트머스를
  사용한 다른 시크릿 관리 모드에 대한 지원은 아직 테스트되거나 구현되지 않았습니다.
- 일부 카오스 실험에서는 실험 파드 내에서 도커 API를 사용하므로 도커 소켓을 마운트해야 합니다. 이러한 실험을 실행하기 위해
  개발자/데브옵스(devops) 관리자/SRE의 접근을 허용할 때 사용자의 재량에 따라 수행합니다.
- 카오스 실험에서 특권을 가진 컨테이너를 사용하는(드물지만) 경우, 권장되는 보안 정책이 문서화될 예정입니다.

## 라이선스

리트머스는 아파치(Apache) 라이선스 버전 2.0을 적용합니다. 전체 라이선스 텍스트는 [LICENSE](./LICENSE)를 참고하세요. 리트머스 프로젝트에서 사용하는 일부 프로젝트는 다른 라이선스에 적용받을 수 있으며, 별도의 라이선스를 참고하세요.

[![FOSSA 상태](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

리트머스 카오스는 CNCF 프로젝트의 일부입니다.

[![CNCF](https://github.com/cncf/artwork/blob/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/selected=litmus)

## 커뮤니티

리트머스 커뮤니티는 매월 세 번째 수요일 10:00 PM IST/9.30 AM PST에 모입니다.

커뮤니티 리소스:

- [슬랙 커뮤니티](https://slack.litmuschaos.io)
- [화상 회의 링크 동기화](https://zoom.us/j/91358162694)
- [회의 어젠다 및 회의록 동기화](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [유튜브 채널(데모, 회의 녹화, 가상 밋업)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
- [릴리스 추적기](https://github.com/litmuschaos/litmus/milestones)

## 중요한 링크

<a href="https://docs.litmuschaos.io">
  리트머스 문서 <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="리트머스 문서" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  CNCF Landscape <img src="https://landscape.cncf.io/images/left-logo.svg" alt="CNCF Landscape의 리트머스" height="15">
</a>
