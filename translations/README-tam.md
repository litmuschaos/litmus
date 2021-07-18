<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200" align="left">

# லிட்மஸ்(Litmus)
### கிளவுட்-நேட்டிவ் குழப்ப பொறியியல்

[![Slack Channel](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
![GitHub Workflow](https://github.com/litmuschaos/litmus/actions/workflows/push.yml/badge.svg?branch=master)
[![Docker Pulls](https://img.shields.io/docker/pulls/litmuschaos/chaos-operator.svg)](https://hub.docker.com/r/litmuschaos/chaos-operator)
[![GitHub stars](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![Twitter Follow](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/3202/badge)](https://bestpractices.coreinfrastructure.org/projects/3202)
[![BCH compliance](https://bettercodehub.com/edge/badge/litmuschaos/litmus?branch=master)](https://bettercodehub.com/)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![YouTube Channel](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br><br><br>


## கண்ணோட்டம்

லிட்மஸ் என்பது கிளவுட்-நேட்டிவ் குழப்ப(chaos) பொறியியலை செயல்படுத்தும் ஒரு கருவி. எஸ்.ஆர்.இ.க்கள் தங்கள் வரிசைப்படுத்தல்களில் பலவீனங்களைக் கண்டறிய உதவும் வகையில் குபெர்னெட்டஸில் குழப்பத்தைத் தீர்ப்பதற்கான கருவிகளை லிட்மஸ் வழங்குகிறது. ஆரம்பத்தில் அரங்கு சூழலில் குழப்ப சோதனைகளை இயக்க எஸ்.ஆர்.இ.க்கள் லிட்மஸைப் பயன்படுத்துகின்றன, இறுதியில் உற்பத்தியில் ஏற்படும் பிழைகள், பாதிப்புகளைக் கண்டறிய  உள்ளன. பலவீனங்களை சரிசெய்வது இயக்கத்தின் புத்துணர்ச்சியை அதிகரிக்க வழிவகுக்கிறது.

குழப்பத்தை உருவாக்க, நிர்வகிக்க மற்றும் கண்காணிக்க லிட்மஸ் கிளவுட்-நேட்டிவ் அணுகுமுறை பயன்படுத்தபடுகிறது. பின்வரும் குபெர்னெட்ஸ் தனிப்பயன் வள வரையறைகளை (* சிஆர்டிகள் *) பயன்படுத்தி குழப்பம் திட்டமிடப்பட்டுள்ளது:

- **குழப்பஇயந்திரம்**: ஒரு குபெர்னெட்ஸ் செயலி அல்லது குபெர்னெட்ஸ் கணுவை ஒரு குழப்ப சோதனைகளுடன் இணைப்பதற்கான ஆதாரம். குழப்ப இயந்திரம் லிட்மஸின் குழப்ப-இயக்குபவரால் கண்காணிக்கப்படுகிறது, பின்னர் அது குழப்ப-பரிசோதனைகளைச் செயல்படுத்துகிறது.
- **குழப்பசோதனை**: குழப்பமான சோதனையின் உள்ளமைவு அளவுருக்களை தொகுக்க ஒரு ஆதாரம். குழப்பஇயந்திரம் ஆல் சோதனைகள் மேற்கொள்ளப்படும்போது குழப்பசோதனை CR கள் இயக்குபவரால் உருவாக்கப்படுகின்றன.
- **குழப்பமுடிவு**: குழப்ப-பரிசோதனையின் முடிவுகளை வைத்திருக்க ஒரு ஆதாரம். கேயாஸ்-ஏற்றுமதியாளர் முடிவுகளைப் படித்து, அளவீடுகளை உள்ளமைக்கப்பட்ட ப்ரோமிதியஸ் சேவையகத்தில் ஏற்றுமதி செய்கிறார்.

குழப்ப சோதனைகள் <a href="https://hub.litmuschaos.io" target="_blank"> tub.litmuschaos.io </a> இல் பதிவேற்றப்பட்டுள்ளது. செயலியின் உருவாக்குநர்கள் அல்லது விற்பனையாளர்கள் தங்கள் குழப்பமான சோதனைகளைப் பகிர்ந்து கொள்ளும் ஒரு  மையமாக இது உள்ளது, இதனால் உற்பத்தியில் பயன்பாடுகளின் ஏற்படும் பின்னடைவை தகர்த்து, சீரான பயன்பாட்டினை அதிகரிப்பதன் மூலம்  பயனர்கள் பயன் பெறுகிறார்கள்.

![லிட்மஸ் பணிப்பாய்வு](/images/litmus-arch_1.png)

## பயன்பாடு வழக்குகள்

- **உருவாக்குபவர்களுக்கு**: செயலி வளர்ச்சியின் போது குழப்ப சோதனைகளை அலகு சோதனை அல்லது ஒருங்கிணைப்பு சோதனையின் நீட்டிப்பாக இயக்குக.
- **CI குழாய் கட்டுபவர்களுக்கு**: செயலியின் பயன்பாடு ஒரு குழாய்வழியில் தோல்வியுற்ற பாதைகளுக்கு உட்படுத்தப்படும்போது பிழைகள் கண்டுபிடிக்க குழப்பத்தை ஒரு குழாய் கட்டமாக இயக்க.
- **SREs களுக்கு**: பயன்பாடு மற்றும் / அல்லது சுற்றியுள்ள உள்கட்டமைப்பில் குழப்பமான சோதனைகளைத் திட்டமிட்டு வரையறைப்படுத்தல். இந்த நடைமுறை அமைப்பில் உள்ள பலவீனங்களை அடையாளம் கண்டு, பின்னடைவை தகர்த்து புதிய ஆற்றலை அதிகரிக்க வழிசெய்கிறது.

## லிட்மஸுடன் தொடங்குதல்

[![IMAGE ALT TEXT](/images/maxresdefault.jpg)](https://youtu.be/W5hmNbaYPfM)

லிட்மஸுடன் தொடங்குவதற்கு  <a href="https://docs.litmuschaos.io/docs/next/getstarted.html" target="_blank">லிட்மஸ் ஆவணம்</a> பாருங்கள்

## குழப்ப மையத்திற்கு பங்களிப்பு

குழப்ப மையத்திற்கான <a href="https://github.com/litmuschaos/community-charts/blob/master/CONTRIBUTING.md" target="_blank">பங்களிப்பு வழிகாட்டுதல்களைப் பாருங்கள்</a> 

## கருத்தில் கொள்ள வேண்டிய விஷயங்கள்

லிட்மஸுடன் (குழப்பமான கட்டமைப்பாக) செய்ய வேண்டிய சில பரிசீலனைகள் இங்கு பரவலாக பட்டியலிடப்பட்டுள்ளன. இவற்றில் பல ஏற்கனவே வேலை செய்யப்படுகின்றன
[சாலை வரைபடம்](./ROADMAP.md) இல் குறிப்பிட்டுள்ளபடி.குறிப்பிட்ட சோதனைகளைச் சுற்றியுள்ள விவரங்கள் அல்லது வரம்புகளுக்கு, அந்தந்த [சோதனைகள் டாக்ஸ்](https://docs.litmuschaos.io/docs/pod-delete/) ஐப் பார்க்கவும்.

- லிட்மஸ் குழப்ப இயக்குபவர் மற்றும் குழப்பமான சோதனைகள்  குபெர்னெட்ஸ் வளங்களாக கொத்துக்களுடன் இயங்குகின்றன. காற்று மூடிய சூழல்களில், குழப்பம் விருப்ப வளங்கள் மற்றும் படங்களை வளாகத்தில் பதிவேற்றம் செய்ய பட வேண்டும்
-இயக்க வழிதடங்களில் குறிப்பிட்ட குழப்பமான சோதனைகளை (AWS, GCP மேகம் போன்றவை) செயல்படுத்த முயற்சிக்கும்போது, அணுகல் விவரங்கள் குபெர்னெட்ஸ் ரகசியங்கள் வழியாக அனுப்பப்படுகின்றன. லிட்மஸுடனான ரகசிய நிர்வாகத்தின் பிற முறைகளுக்கான ஆதரவு இன்னும் சோதிக்கப்படவில்லை / செயல்படுத்தப்படவில்லை.
- சில குழப்பமான சோதனைகள் டோக்கர் ஏபியை சோதனைக் காய்களிலிருந்து பயன்படுத்துகின்றன, இதன் மூலம் டோக்கர் சாக்கெட் ஏற்றப்பட வேண்டும். பயனர் விருப்பப்படி இந்த சோதனைகளை இயக்குவதற்கு டெவலப்பர்கள் / டெவொப்ஸ் நிர்வாகிகள் / எஸ்.ஆர்.இ.களை அணுக அனுமதிக்கும்போது அறிவுறுத்தப்படுகிறது.
- குழப்பமான சோதனைகள் சலுகை பெற்ற கொள்கலன்களைப் பயன்படுத்துகின்ற (அரிதான) சந்தர்ப்பங்களில், பரிந்துரைக்கப்பட்ட பாதுகாப்புக் கொள்கைகள் ஆவணப்படுத்தப்படும்.


## சமூகம்

சமூக வளங்கள்:

உங்களிடம் ஏதேனும் கேள்விகள், கவலைகள் அல்லது அம்ச கோரிக்கைகள் இருந்தால் அடைய தயங்க

- ட்விட்டரில் லிட்மஸ்காவோஸைப் பின்தொடரவும் [@LitmusChaos](https://twitter.com/LitmusChaos).

- வழக்கமான புதுப்பிப்புகள் மற்றும் சந்திப்பு பதிவுகளுக்கு [LitmusChaos YouTube channel](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw) சேனலுக்கு குழுசேரவும்.

-எங்கள் [ஸ்லாக் சமூகத்தில்](https://slack.litmuschaos.io/) சேரவும், எங்கள் சமூக உறுப்பினர்களைச் சந்திக்கவும், உங்கள் கேள்விகளையும் கருத்துக்களையும் முன்வைத்து, [குபெர்னெட்ஸ் ஸ்லாக்](https://slack.k8s.io/) இல் உள்ள #litmus சேனலில் சேரவும். 
### சமூக கூட்டங்கள்
லிட்மஸ் சமூகம் ஒவ்வொரு மாதமும் மூன்றாவது புதன்கிழமை இரவு 10:00 மணிக்கு IST / 6: 30 PM CEST / 9: 30 AM PST இல் சந்திக்கிறது.

- [சந்திப்பு இணைப்பை ஒத்திசைக்கவும்](https://zoom.us/j/91358162694)

- [நிகழ்ச்சி நிரல் மற்றும் கூட்டக் குறிப்புகளை ஒத்திசைக்கவும்](https://hackmd.io/a4Zu_sH4TZGeih-xCimi3Q)
- [டிராக்கரை விடுவிக்கவும்](https://github.com/litmuschaos/litmus/milestones)

### வலைப்பதிவுகள்

- சி.என்.சி.எஃப்: [லிட்மஸ்காவோஸுக்கு அறிமுகம்](https://www.cncf.io/blog/2020/08/28/introduction-to-litmuschaos/)
- ஹேக்கர்னூன்: [லிட்மஸ் தனிப்பயன் வளங்கள் வழியாக குழப்பத்தை நிர்வகிக்கவும் கண்காணிக்கவும்](https://hackernoon.com/solid-tips-on-how-to-manage-and-monitor-chaos-via-litmus-custom-resources-5g1s33m9)
- [குழப்பத்தில் காணக்கூடிய கருத்தாய்வு: அளவீட்டு கதை](https://dev.to/ksatchit/observability-considerations-in-chaos-the-metrics-story-6cb)

சமூக வலைப்பதிவுகள்:

- டேனியல் ரெய்ன்: [எனது சூழலில் கேயாஸ் பொறியியல் தேவையா? உங்களுக்கு இது தேவை என்று என்னை நம்புங்கள்!](https://maveric-systems.com/blog/do-i-need-chaos-engineering-on-my-environment-trust-me-you-need-it/)
- ஜெசிகா செர்ரி: [உங்கள் முனையத்தில் குபெர்னெட்ஸ் கிளஸ்டர் தோல்விகள் மற்றும் சோதனைகளை சோதிக்கவும்](https://opensource.com/article/21/6/kubernetes-litmus-chaos)
- யாங் சுவான்ஷெங் (குபேஸ்பியர்): [குபேஸ்பியர் 部署 லிட்மஸ் u குபர்னெட்டஸ் 开启 混沌 实验](https://kubesphere.io/zh/blogs/litmus-kubesphere/)
- சாயம் பதக் (சிவோ): [உங்கள் கொத்து உற்பத்தி தயாராக இருப்பதை உறுதிசெய்ய லிட்மஸைப் பயன்படுத்தி குபெர்னெட்ஸில் குழப்பமான பரிசோதனைகள்](https://www.civo.com/learn/chaos-engineering-kubernetes-litmus)
- ஆண்ட்ரியாஸ் கிரிவாஸ் (கொள்கலன் தீர்வுகள்): [குபெர்னெட்ஸ் பணிச்சுமைகளுக்கான கேயாஸ் பொறியியல் கருவிகளை ஒப்பிடுவது](https://blog.container-solutions.com/comparing-chaos-engineering-tools)
- அக்ரம் ரியாஹி (வெஸ்கேல்): [கேயாஸ் பொறியியல்: லிட்மஸ் ச ous ஸ் டவுஸ் லெஸ் கோணங்கள்](https://blog.wescale.fr/2021/03/11/chaos-engineering-litmus-sous-tous-les-angles/)
- பிரஷாந்தோ பிரியான்ஷு (லென்ஸ்கார்ட்): [கேயாஸ் இன்ஜினியரிங்-பகுதி 2 க்கு லென்ஸ்கார்ட்டின் அணுகுமுறை](https://blog.lenskart.com/lenskarts-approach-to-chaos-engineering-part-2-6290e4f3a74e)
- DevsDay.ru (ரஷியன்): [குபேக்கான் EU '21 இல் லிட்மஸ்காஸ்](https://devsday.ru/blog/details/40746)
- ரியான் பீ (ஆர்மரி): [உங்கள் ஸ்பின்னக்கர் பைப்லைனில் லிட்மஸ்காஸ்](https://www.armory.io/blog/litmuschaos-in-your-spinnaker-pipeline/)
- டேவிட் கில்டே (ஜீப்ரியம்): [குபெர்னெட்டில் லிட்மஸ் கேயாஸ் எஞ்சினுடன் தன்னாட்சி கண்காணிப்பைப் பயன்படுத்துதல்](https://www.zebrium.com/blog/using-autonomous-monitoring-with-litmus-chaos-engine-on-kubernetes)

## தத்தெடுப்பாளர்கள்

<a href="https://github.com/litmuschaos/litmus/blob/master/ADOPTERS.md" target="_blank"> LitmusChaos ஐ ஏற்றுக்கொள்பவர்கள் </a> ஐப் பாருங்கள்
(உங்கள் குழப்பமான பொறியியல் பயிற்சியில் நீங்கள் லிட்மஸைப் பயன்படுத்துகிறீர்கள் என்றால் மேலே உள்ள பக்கத்திற்கு ஒரு PR ஐ அனுப்பவும்)

## உரிமம்

லிட்மஸ் அப்பாச்சி உரிமம், பதிப்பு 2.0 இன் கீழ் உரிமம் பெற்றது. முழு உரிம உரைக்கு [LICENSE](./LICENSE) ஐப் பார்க்கவும். லிட்மஸ் திட்டத்தால் பயன்படுத்தப்படும் சில திட்டங்கள் வேறு உரிமத்தால் நிர்வகிக்கப்படலாம், தயவுசெய்து அதன் குறிப்பிட்ட உரிமத்தைப் பார்க்கவும்.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_large)

லிட்மஸ் கேயாஸ் சி.என்.சி.எஃப் திட்டங்களின் ஒரு பகுதியாகும்.



[![CNCF](https://raw.githubusercontent.com/cncf/artwork/master/other/cncf/horizontal/color/cncf-color.png)](https://landscape.cncf.io/)

## முக்கிய இணைப்புகள்

<a href="https://docs.litmuschaos.io">
  லிட்மஸ் ஆவணம் <img src="https://avatars0.githubusercontent.com/u/49853472?s=200&v=4" alt="Litmus Docs" height="15">
</a>
<br>
<a href="https://landscape.cncf.io/selected=litmus">
  சி.என்.சி.எஃப் நிலப்பரப்பு <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" height="15">
</a>
