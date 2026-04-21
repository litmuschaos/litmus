import React from 'react';
import { ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import type { MutationFunction } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import noProbes from '@images/noProbes.svg';
import { useStrings } from '@strings';
import { ParentComponentErrorWrapper } from '@errors';
import { useRouteWithBaseUrl } from '@hooks';
import type { AddProbeRequest, AddProbeResponse } from '@api/core';
import Loader from '@components/Loader';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import css from './SelectProbesTab.module.scss';

interface NoProbesProps {
  loading: boolean;
  addKubernetesCMDProbeMutation: MutationFunction<AddProbeResponse, AddProbeRequest>;
}

export default function NoProbes({ loading }: NoProbesProps): React.ReactElement {
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();

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
                permission={PermissionGroup.EDITOR}
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
