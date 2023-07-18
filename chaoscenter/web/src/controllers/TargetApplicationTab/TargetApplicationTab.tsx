import React from 'react';
import { KubeGVRRequest, kubeObjectSubscription } from '@api/core';
import type { ChaosEngine, FaultData } from '@models';
import { TargetApplicationTab } from '@views/ExperimentCreationFaultConfiguration/Tabs';
import type { AppInfoData, TargetApplicationData } from './types';
import { gvrData } from './grvData';

interface TargetApplicationControllerProps {
  engineCR: ChaosEngine | undefined;
  infrastructureID: string | undefined;
  setFaultData: React.Dispatch<React.SetStateAction<FaultData | undefined>>;
}

export default function TargetApplicationTabController({
  engineCR,
  infrastructureID,
  setFaultData
}: TargetApplicationControllerProps): React.ReactElement {
  const [appInfoData, setAppInfoData] = React.useState<AppInfoData[]>([]);
  const [targetApp, setTargetApp] = React.useState<TargetApplicationData>({
    ...engineCR?.spec?.appinfo
  });
  const [selectedGVR, setSelectedGVR] = React.useState<KubeGVRRequest>();
  const { data: result, loading } = kubeObjectSubscription({
    shouldResubscribe: true,
    skip: targetApp?.appkind === undefined || selectedGVR === undefined,
    request: {
      infraID: infrastructureID ?? '',
      kubeObjRequest: selectedGVR,
      objectType: 'kubeobject'
    }
  });

  // Call this for 1st render to pre-populate the data
  React.useEffect(() => {
    gvrData.map(data => {
      if (data.resource === targetApp?.appkind) {
        setSelectedGVR({
          group: data.group,
          version: data.version,
          resource: `${data.resource}s`
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetApp?.appkind]);

  /**
   * UseEffect to filter the labels according to the namespace provided
   * Required to populate the appLabels dropdown
   */
  React.useEffect(() => {
    if (result?.getKubeObject) {
      const appInfo: AppInfoData[] = [];
      const kubeData = result.getKubeObject.kubeObj;
      kubeData.forEach(obj => {
        const applabels: string[] = [];
        obj.data.forEach(objData => {
          if (objData.labels) {
            applabels.push(...objData.labels.filter(() => obj.namespace === targetApp?.appns));
          }
        });
        /**
         * Push these labels corresponding to their namespaces
         */
        appInfo.push({
          namespace: obj.namespace,
          appLabel: applabels
        });
      });

      setAppInfoData(appInfo);
    }
  }, [result?.getKubeObject, targetApp?.appns]);

  return (
    <TargetApplicationTab
      appInfoData={appInfoData}
      targetApp={targetApp}
      setTargetApp={setTargetApp}
      engineCR={engineCR}
      setFaultData={setFaultData}
      infrastructureID={infrastructureID}
      loading={loading}
    />
  );
}
