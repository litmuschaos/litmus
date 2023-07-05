import { useToaster } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { DeploymentScope } from '@components/KubernetesChaosInfrastructureDeploymentCards';
import { listChaosInfra } from '@api/core';
import { DeploymentScopeItem, DeploymentScopeOptions } from '@models';
import { getScope } from '@utils';
import { InfraScope } from '@api/entities';

export interface LoadingProps {
  listChaosInfrastructureLoading: boolean;
}

interface KubernetesChaosInfrastructureDeploymentScopeControllerProps {
  deploymentScope: DeploymentScopeOptions;
  setDeploymentScope: React.Dispatch<React.SetStateAction<DeploymentScopeOptions>>;
  isInfraPresent: boolean;
  setIsInfraPresent: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function KubernetesChaosInfrastructureDeploymentScopeController({
  deploymentScope,
  setDeploymentScope,
  isInfraPresent,
  setIsInfraPresent
}: KubernetesChaosInfrastructureDeploymentScopeControllerProps): React.ReactElement {
  const { environmentID } = useParams<{ environmentID: string }>();
  const scope = getScope();
  const { showError } = useToaster();

  const { loading } = listChaosInfra({
    ...scope,
    environmentIDs: [`${environmentID}`],
    filter: {
      infraScope: InfraScope.CLUSTER
    },
    options: {
      onError: error => showError(error.message),
      onCompleted: data => {
        if (data) {
          data.listInfras.infras.length > 0 && setIsInfraPresent(true);
        }
      }
    }
  });

  return (
    <>
      {loading ? (
        <Icon name="steps-spinner" size={12} />
      ) : (
        <DeploymentScope
          isInfraPresent={isInfraPresent}
          deploymentScope={isInfraPresent ? DeploymentScopeOptions.NAMESPACE : deploymentScope}
          onChange={(value: DeploymentScopeItem) => {
            setDeploymentScope(value.type);
          }}
        />
      )}
    </>
  );
}
