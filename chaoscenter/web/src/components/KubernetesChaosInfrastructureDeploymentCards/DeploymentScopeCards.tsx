import { CollapsableSelectType, FormikCollapsableSelect } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import React from 'react';
import { DeploymentScopeItem, DeploymentScopeOptions } from '@models';
import { useStrings } from '@strings';
import { DeploymentCard } from './DeploymentCard';

interface DeploymentScopeProps {
  deploymentScope: DeploymentScopeOptions;
  className?: string;
  isInfraPresent: boolean;
  onChange: (value: DeploymentScopeItem) => void;
}

export function DeploymentScope({
  deploymentScope,
  onChange,
  isInfraPresent
}: DeploymentScopeProps): React.ReactElement {
  const { getString } = useStrings();

  const deploymentScopeData: DeploymentScopeItem[] = [
    {
      type: DeploymentScopeOptions.CLUSTER,
      value: DeploymentScopeOptions.CLUSTER,
      name: getString('clusterWideAccess'),
      description: getString('clusterScopeDescription'),
      iconName: 'union' as IconName,
      tooltipId: 'chaos_infra_cluster_scope'
    },
    {
      type: DeploymentScopeOptions.NAMESPACE,
      value: DeploymentScopeOptions.NAMESPACE,
      name: getString('specificNamespaceAccess'),
      description: getString('namespaceScopeDescription'),
      iconName: 'gitops-application' as IconName,
      tooltipId: 'chaos_infra_namespace_scope'
    }
  ];

  const deploymentScopeDataNs: DeploymentScopeItem[] = [
    {
      type: DeploymentScopeOptions.NAMESPACE,
      value: DeploymentScopeOptions.NAMESPACE,
      name: getString('specificNamespaceAccess'),
      description: getString('namespaceScopeDescription'),
      iconName: 'gitops-application' as IconName,
      tooltipId: 'chaos_infra_namespace_scope'
    }
  ];

  return (
    <FormikCollapsableSelect<DeploymentScopeItem>
      name="deploymentScope"
      items={isInfraPresent ? deploymentScopeDataNs : deploymentScopeData}
      selected={deploymentScopeData[deploymentScopeData.findIndex(card => card.type === deploymentScope)]}
      onChange={onChange}
      type={CollapsableSelectType.CardView}
      renderItem={data => <DeploymentCard key={`${data.name}`} installationMethod={data} />}
    />
  );
}
