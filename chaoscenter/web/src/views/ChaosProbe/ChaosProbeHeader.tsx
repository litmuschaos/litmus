import React from 'react';
import { ButtonVariation, Container, Heading, Layout, Text, useToggleOpen } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import type { DefaultLayoutTemplateProps } from '@components/DefaultLayout/DefaultLayout';
import { useStrings } from '@strings';
import { getDetailedTime, getIcon } from '@utils';
import type { InfrastructureType, ProbeType } from '@api/entities';
import LitmusBreadCrumbs from '@components/LitmusBreadCrumbs';
import MainNav from '@components/MainNav';
import SideNav from '@components/SideNav';
import { UpdateProbeModal } from '@views/ChaosProbes/UpdateProbeModal';
import { RefetchGetProbes } from '@controllers/ChaosProbe/types';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import css from './ChaosProbe.module.scss';

interface ChaosProbeHeaderProps extends DefaultLayoutTemplateProps {
  title: string;
  probeData: {
    name: string;
    description: string;
    type: ProbeType;
    infrastructureType: InfrastructureType;
  };
  updatedAt: string;
  createdAt: string | undefined;
  refetchProbes: RefetchGetProbes['refetchProbes'];
}

function HeaderToolbar({
  createdAt,
  updatedAt
}: Pick<ChaosProbeHeaderProps, 'createdAt' | 'updatedAt'>): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-end' }}>
      <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
        <span>{getString('createdOn').toUpperCase()}:</span> {createdAt && getDetailedTime(parseInt(createdAt))}
      </Text>
      <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
        <span>{getString('lastModified').toUpperCase()}:</span> {updatedAt && getDetailedTime(parseInt(updatedAt))}
      </Text>
    </Layout.Vertical>
  );
}

export default function ChaosProbeHeader({
  title,
  probeData,
  updatedAt,
  createdAt,
  breadcrumbs,
  children,
  refetchProbes
}: React.PropsWithChildren<ChaosProbeHeaderProps>): React.ReactElement {
  const { getString } = useStrings();
  const { isOpen: isEditProbeOpen, open: setEditProbeOpen, close: setEditProbeClose } = useToggleOpen();

  return (
    <Layout.Horizontal>
      <Container flex className={css.leftSideBar}>
        <MainNav />
        <SideNav />
      </Container>
      <Container height={'100%'} style={{ flexGrow: 1 }}>
        <Container
          style={{ background: `var(--primary-1)`, maxHeight: '105px' }}
          padding={{ left: 'xlarge', right: 'xlarge', top: 'small', bottom: 'medium' }}
          border={{ bottom: true, color: Color.GREY_200 }}
        >
          <LitmusBreadCrumbs links={breadcrumbs} />
          <Layout.Horizontal margin={{ top: 'medium' }} flex={{ alignItems: 'center' }}>
            {/* Icon, title and description */}
            <Layout.Horizontal spacing={'large'}>
              <Icon size={35} name={getIcon(probeData.type)} />
              <Layout.Vertical padding={{ left: 'small' }}>
                <Layout.Horizontal spacing="xsmall">
                  <Heading
                    style={{ marginTop: '-5px', marginRight: '5px' }}
                    level={4}
                    font={{ variation: FontVariation.H4 }}
                    color={Color.GREY_700}
                  >
                    {title}
                  </Heading>
                  <Text font={{ size: 'small' }}>{`${getString(`id`)}: ${probeData.name}`}</Text>
                </Layout.Horizontal>

                <Layout.Horizontal flex={{ alignItems: 'center' }} className={css.gap4}>
                  <Text font={{ size: 'small' }} color={Color.GREY_700} lineClamp={1}>
                    {probeData.description}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
            {/* Details of creation, updation and editing */}
            <Layout.Horizontal spacing={'medium'}>
              <HeaderToolbar createdAt={createdAt} updatedAt={updatedAt} />
              <RbacButton
                text={getString('editProbe')}
                variation={ButtonVariation.SECONDARY}
                icon="Edit"
                permission={PermissionGroup.EDITOR}
                onClick={setEditProbeOpen}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Container>
        <UpdateProbeModal
          refetchProbes={refetchProbes}
          isOpen={isEditProbeOpen}
          hideDarkModal={setEditProbeClose}
          probeName={probeData.name}
          infrastructureType={probeData.infrastructureType}
        />
        {children}
      </Container>
    </Layout.Horizontal>
  );
}
