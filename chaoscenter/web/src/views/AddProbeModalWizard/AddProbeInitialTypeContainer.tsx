import React from 'react';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon, IconName } from '@harnessio/icons';
import { InfrastructureType, ProbeType } from '@api/entities';
import { useStrings } from '@strings';
import { getIcon, getNormalizedProbeName } from '@utils';
import k8s from '@images/k8s.svg';
import prom from '@images/prom.svg';
import { showDetails } from './ShowDetails';
import css from './AddProbeInitialTypeContainer.module.scss';

interface AddProbeInitialTypeContainerProps {
  hideInitialTypeModal: () => void;
  openDarkModal: () => void;
  infrastructureType: InfrastructureType | undefined;
  setInfrastructureType: React.Dispatch<React.SetStateAction<InfrastructureType>>;
}

interface CardProps {
  icon: IconName;
  type: ProbeType;
  hideInitialTypeModal: () => void;
  openDarkModal: () => void;
  setHoverType: React.Dispatch<React.SetStateAction<ProbeType | undefined>>;
}

function Card({ icon, type, hideInitialTypeModal, openDarkModal, setHoverType }: CardProps): React.ReactElement {
  return (
    <Container
      style={{ cursor: 'pointer' }}
      onClick={() => {
        localStorage.setItem('probeType', type);
        hideInitialTypeModal();
        openDarkModal();
      }}
      onMouseEnter={() => {
        setHoverType(type);
      }}
      width="64px"
    >
      <div className={css.card}>
        <Icon name={icon} size={25} className={css.icon} />
      </div>
      <Text font={{ variation: FontVariation.SMALL, align: 'center' }} padding={{ top: 'small' }} color={Color.GREY_0}>
        {getNormalizedProbeName(type)}
      </Text>
    </Container>
  );
}

function AddProbeInitialTypeContainer({
  hideInitialTypeModal,
  openDarkModal,
  infrastructureType
}: AddProbeInitialTypeContainerProps): React.ReactElement {
  const { getString } = useStrings();
  const [hoverType, setHoverType] = React.useState<ProbeType>();

  return (
    <Layout.Horizontal
      height="100%"
      spacing="medium"
      padding="large"
      flex={{ justifyContent: 'space-between' }}
      background={Color.PRIMARY_9}
    >
      <Layout.Vertical height="90%" width="50%" padding={{ left: 'xlarge' }}>
        <div>
          <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xlarge' }} color={Color.WHITE}>
            {getString(`selectYourProbeType`)}
          </Text>
          {/* <Layout.Vertical spacing={'small'}>
            <Text font={{ variation: FontVariation.FORM_LABEL }} color={Color.WHITE}>
              {getString('selectChaosInfrastructureType')}
            </Text>
            <CardSelect<InfrastructureSelectProps>
              data={infrastructureList}
              cornerSelected
              className={css.cardSelect}
              renderItem={infrastructure => (
                <Layout.Vertical margin={{ right: 'medium' }}>
                  <Layout.Horizontal>
                    {infrastructure.type && (
                      <Icon name={getInfraIcon(infrastructure.type)} size={26} style={{ marginRight: '8px' }} />
                    )}
                    <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_1000}>
                      {infrastructure.type}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Vertical padding={{ top: 'medium' }}>
                    <Text font={{ variation: FontVariation.FORM_LABEL }} color={Color.GREY_400}>
                      {getString('supportedFaultTypes')}
                    </Text>
                    <Layout.Horizontal padding={{ top: 'small' }}>
                      {infrastructure.supportedFaults.map(supportedFault => (
                        <Icon key={supportedFault} name={supportedFault as IconName} margin={{ right: 'small' }} />
                      ))}
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Layout.Vertical>
              )}
              selected={infrastructureList.find(item => item.type === infrastructureType)}
              onChange={selectedInfra => setInfrastructureType(selectedInfra.type)}
            />
          </Layout.Vertical> */}
          <Layout.Vertical spacing={'small'} margin={{ top: 'medium' }}>
            <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'large' }} color={Color.WHITE}>
              {getString(`selectYourProbe`)}
            </Text>
            <Container className={css.grid}>
              <Card
                icon={getIcon(ProbeType.HTTP)}
                type={ProbeType.HTTP}
                hideInitialTypeModal={hideInitialTypeModal}
                openDarkModal={openDarkModal}
                setHoverType={setHoverType}
              />
              <Card
                icon={getIcon(ProbeType.CMD)}
                type={ProbeType.CMD}
                hideInitialTypeModal={hideInitialTypeModal}
                openDarkModal={openDarkModal}
                setHoverType={setHoverType}
              />
              {infrastructureType === InfrastructureType.KUBERNETES && (
                <Card
                  icon={
                    (
                      <div className={css.box}>
                        <img loading="lazy" src={prom} alt="prom probe" />
                      </div>
                    ) as any
                  }
                  type={ProbeType.PROM}
                  hideInitialTypeModal={hideInitialTypeModal}
                  openDarkModal={openDarkModal}
                  setHoverType={setHoverType}
                />
              )}
              {infrastructureType === InfrastructureType.KUBERNETES && (
                <Card
                  icon={
                    (
                      <div className={css.box}>
                        <img loading="lazy" src={k8s} alt="k8s probe" />
                      </div>
                    ) as any
                  }
                  type={ProbeType.K8S}
                  hideInitialTypeModal={hideInitialTypeModal}
                  openDarkModal={openDarkModal}
                  setHoverType={setHoverType}
                />
              )}
            </Container>
          </Layout.Vertical>
        </div>
      </Layout.Vertical>

      <Layout.Vertical width="50%" flex={{ justifyContent: 'center' }}>
        <Container width={'350px'}>{hoverType && showDetails(hoverType, getString)}</Container>
      </Layout.Vertical>
    </Layout.Horizontal>
  );
}

export default AddProbeInitialTypeContainer;
