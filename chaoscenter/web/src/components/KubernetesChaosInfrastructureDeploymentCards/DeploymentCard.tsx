import { Text, Layout } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import { FontVariation } from '@harnessio/design-system';
import React from 'react';

export interface DeploymentCardProps {
  name: string;
  description: string;
  iconName: IconName;
  tooltipId?: string;
}

export function DeploymentCard({
  installationMethod
}: {
  installationMethod: DeploymentCardProps;
}): React.ReactElement {
  const isDeploymentScope = installationMethod.name === 'Cluster Wide' || installationMethod.name === 'Namespace mode';

  return (
    <>
      {isDeploymentScope ? (
        <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }} spacing="small">
          <Icon style={{ marginBottom: '14px' }} name={installationMethod.iconName} size={32} />
          <div>
            <Text font={{ variation: FontVariation.BODY2 }}>{installationMethod.name}</Text>
            <Text
              font={{ variation: FontVariation.SMALL }}
              style={{ marginTop: '11px', maxWidth: '237px', color: `var(--grey-500)` }}
            >
              {installationMethod.description}
            </Text>
          </div>
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'flex-start' }} spacing="small">
          <Icon style={{ marginLeft: '5px', marginBottom: '18px' }} name={installationMethod.iconName} size={32} />
          <div>
            <Text font={{ variation: FontVariation.BODY2 }}>{installationMethod.name}</Text>
            <Text
              font={{ variation: FontVariation.BODY }}
              style={{ marginTop: '4px', maxWidth: '337px', color: `var(--grey-600)` }}
            >
              {installationMethod.description}
            </Text>
          </div>
        </Layout.Horizontal>
      )}
    </>
  );
}
