import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { KubernetesChaosInfrastructure, InfrastructureUpdateStatus } from '@api/entities';
import { getKubernetesChaosInfrastructureManifest, getVersionDetails } from '@api/core';
import { downloadYamlAsFile, generateUpgradeInfrastructureName, getScope, toSentenceCase } from '@utils';
import { useStrings } from '@strings';
import KubernetesChaosInfrastructureUpgradeView from '@views/KubernetesChaosInfrastructureUpgrade';

interface KubernetesChaosInfrastructureUpgradeControllerProps {
  kubernetesChaosInfrastructureItem: KubernetesChaosInfrastructure;
}

export default function KubernetesChaosInfrastructureUpgradeController({
  kubernetesChaosInfrastructureItem
}: KubernetesChaosInfrastructureUpgradeControllerProps): React.ReactElement {
  const isUpgradeAvailable = kubernetesChaosInfrastructureItem.updateStatus !== InfrastructureUpdateStatus.NOT_REQUIRED;
  const scope = getScope();
  const { getString } = useStrings();
  const { showError, showSuccess } = useToaster();

  const { data: versionDetails } = getVersionDetails({
    ...scope,
    options: {
      skip: !isUpgradeAvailable,
      onError: err => showError(err)
    }
  });

  const [getChaosInfrastructureManifestQuery] = getKubernetesChaosInfrastructureManifest({
    ...scope,
    infraID: kubernetesChaosInfrastructureItem.infraID,
    upgrade: true,
    options: {
      onCompleted: data => {
        if (data) {
          showSuccess(getString('downloadSuccess'));
          downloadYamlAsFile(
            data.getInfraManifest,
            generateUpgradeInfrastructureName({
              infrastructureName: kubernetesChaosInfrastructureItem.name,
              latestVersion: versionDetails?.getVersionDetails.latestVersion ?? ''
            })
          );
        }
      },
      onError: err => {
        showError(toSentenceCase(err.message));
      }
    }
  });

  const latestVersion = versionDetails?.getVersionDetails?.latestVersion ?? '';

  return (
    <KubernetesChaosInfrastructureUpgradeView
      latestVersion={latestVersion}
      isUpgradeAvailable={isUpgradeAvailable}
      kubernetesChaosInfrastructureID={kubernetesChaosInfrastructureItem.infraID}
      kubernetesChaosInfrastructureName={kubernetesChaosInfrastructureItem.name}
      getChaosInfrastructureManifestQuery={getChaosInfrastructureManifestQuery}
    />
  );
}
