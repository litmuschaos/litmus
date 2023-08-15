import { Text, ButtonVariation, Layout } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import React from 'react';
import type { MutationFunction } from '@apollo/client';
import type {
  TestKubernetesChaosInfrastructureConnectionResponse,
  TestKubernetesChaosInfrastructureConnectionRequest
} from '@api/core';
import { getScope } from '@utils';
import { ParentComponentErrorWrapper } from '@errors';
import { useStrings } from '@strings';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';

interface KubernetesChaosInfrastructureConnectionTestViewProps {
  infraID: string;
  displayIcon: boolean;
  icon: IconName;
  buttonText: string;
  connectionTestLoading?: boolean;
  testKubernetesChaosInfrastructureConnectionMutation?: MutationFunction<
    TestKubernetesChaosInfrastructureConnectionResponse,
    TestKubernetesChaosInfrastructureConnectionRequest
  >;
}

function KubernetesChaosInfrastructureConnectionTestView({
  infraID,
  displayIcon,
  icon,
  buttonText,
  connectionTestLoading,
  testKubernetesChaosInfrastructureConnectionMutation
}: KubernetesChaosInfrastructureConnectionTestViewProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();

  return connectionTestLoading ? (
    <Layout.Horizontal flex={{ alignItems: 'center' }} style={{ gap: '0.5rem' }}>
      <Icon name="steps-spinner" style={{ marginLeft: '4px' }} color={Color.GREY_600} />
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
        {getString('testingConnection')}
      </Text>
    </Layout.Horizontal>
  ) : (
    <ParentComponentErrorWrapper>
      <RbacButton
        text={buttonText}
        minimal
        onClick={() => {
          testKubernetesChaosInfrastructureConnectionMutation?.({
            variables: {
              projectID: scope.projectID,
              infraId: infraID
            }
          });
        }}
        icon={displayIcon ? icon : undefined}
        permission={PermissionGroup.EDITOR}
        variation={ButtonVariation.SECONDARY}
      />
    </ParentComponentErrorWrapper>
  );
}

export default KubernetesChaosInfrastructureConnectionTestView;
