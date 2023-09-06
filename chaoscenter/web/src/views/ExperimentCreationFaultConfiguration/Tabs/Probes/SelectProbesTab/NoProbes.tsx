import React from 'react';
import { ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import type { MutationFunction } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import noProbes from '@images/noProbes.svg';
import { useStrings } from '@strings';
import { ParentComponentErrorWrapper } from '@errors';
import { useRouteWithBaseUrl, useSearchParams } from '@hooks';
import { getScope } from '@utils';
import type { AddProbeRequest, AddProbeResponse } from '@api/core';
import { InfrastructureType } from '@api/entities';
import Loader from '@components/Loader';
import { KUBERENTES_SYSTEM_PROBE_CONFIG } from '@constants/SystemProbe';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import css from './SelectProbesTab.module.scss';

interface NoProbesProps {
  loading: boolean;
  addKubernetesCMDProbeMutation: MutationFunction<AddProbeResponse, AddProbeRequest>;
}

export default function NoProbes({ loading, addKubernetesCMDProbeMutation }: NoProbesProps): React.ReactElement {
  const scope = getScope();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  const { getString } = useStrings();

  const createSystemProbe = (): void => {
    // Request Payload for Add
    const addProbePayload: AddProbeRequest = {
      projectID: scope.projectID,
      request: KUBERENTES_SYSTEM_PROBE_CONFIG
    };

    if (infrastructureType === InfrastructureType.KUBERNETES)
      addKubernetesCMDProbeMutation({
        variables: addProbePayload
      });
  };

  return (
    <Loader loading={loading} height="var(--page-min-height)">
      <Container className={css.noProbes}>
        <img src={noProbes} alt={getString('noProbes')} />
        <Text
          font={{ variation: FontVariation.SMALL_SEMI }}
          color={Color.PRIMARY_10}
          lineClamp={1}
          className={css.title}
        >
          {getString('noProbes')}
        </Text>
        <Text
          font={{ variation: FontVariation.SMALL_SEMI }}
          margin={{ bottom: 'xlarge' }}
          color={Color.GREY_500}
          className={css.subtitle}
        >
          {getString('noProbeExecutionDetails.subtitle')}
        </Text>
        <Layout.Vertical spacing={'medium'} flex={{ justifyContent: 'center' }}>
          <Layout.Horizontal spacing={'medium'}>
            <ParentComponentErrorWrapper>
              <RbacButton
                permission={PermissionGroup.EDITOR || PermissionGroup.OWNER}
                variation={ButtonVariation.PRIMARY}
                text={getString('addSystemProbe')}
                icon="plus"
                onClick={createSystemProbe}
              />
            </ParentComponentErrorWrapper>
            <ParentComponentErrorWrapper>
              <RbacButton
                permission={PermissionGroup.EDITOR || PermissionGroup.OWNER}
                variation={ButtonVariation.PRIMARY}
                text={getString('addProbe')}
                icon="plus"
                onClick={() =>
                  history.push({
                    pathname: paths.toChaosProbes()
                  })
                }
              />
            </ParentComponentErrorWrapper>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    </Loader>
  );
}
