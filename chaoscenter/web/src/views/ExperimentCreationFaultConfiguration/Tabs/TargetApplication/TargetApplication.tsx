import React from 'react';
import { Container, DropDown, Layout, SelectOption, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import type { ChaosEngine, FaultData } from '@models';
import { gvrData } from '@controllers/TargetApplicationTab/grvData';
import { useStrings } from '@strings';
import type { AppInfoData, TargetApplicationData } from '@controllers/TargetApplicationTab/types';

interface TargetApplicationViewProps {
  appInfoData: AppInfoData;
  namespaceData: string[];
  targetApp: TargetApplicationData | undefined;
  setTargetApp: React.Dispatch<React.SetStateAction<TargetApplicationData>>;
  engineCR: ChaosEngine | undefined;
  setFaultData: React.Dispatch<React.SetStateAction<FaultData | undefined>>;
  // getKubeObjectLazyQueryFunction: LazyQueryFunction<KubeObjResponse, KubeObjRequest>;
  infrastructureID: string | undefined;
  loadingNamespace: boolean;
  loadingObject: boolean;
}

export default function TargetApplicationTab({
  appInfoData,
  namespaceData,
  targetApp,
  setTargetApp,
  engineCR,
  setFaultData,
  // getKubeObjectLazyQueryFunction,
  loadingNamespace,
  loadingObject
}: TargetApplicationViewProps): React.ReactElement {
  const { getString } = useStrings();

  function getAppKindItems(): SelectOption[] {
    return gvrData.map(data => ({
      label: data.resource,
      value: data.resource
    }));
  }

  function getAppNamespaceItems(): SelectOption[] {
    if (loadingNamespace) return [];
    return namespaceData.map(data => ({
      label: data,
      value: data
    }));
  }

  function getAppLabelItems(): SelectOption[] {
    if (loadingObject) return [];
    //    const filteredAppInfo = appInfoData.filter(data => data.namespace === targetApp?.appns)[0];
    return appInfoData?.appLabel.map(data => ({
      label: data,
      value: data
    }));
  }

  return (
    <Layout.Vertical background={Color.PRIMARY_BG} height={'100%'}>
      <Container padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge', bottom: 'xlarge' }}>
        <Text font={{ variation: FontVariation.BODY }}>{getString('provideTargetApplicationDetails')}</Text>
        {engineCR?.spec?.appinfo?.appkind !== undefined && (
          <Layout.Vertical margin={{ top: 'medium', bottom: 'medium' }} spacing="xsmall">
            <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('appKind')}</Text>
            <DropDown
              width={'50%'}
              placeholder={getString('selectAppKind')}
              items={getAppKindItems()}
              value={targetApp?.appkind}
              onChange={selectedItem => {
                setTargetApp({
                  appkind: selectedItem.label,
                  applabel: '',
                  appns: ''
                });
                if (engineCR?.spec?.appinfo?.appkind !== undefined) engineCR.spec.appinfo.appkind = selectedItem.label;
                setFaultData(faultData => {
                  if (faultData?.faultName) return { ...faultData, engineCR: faultData?.engineCR };
                });
              }}
            />
          </Layout.Vertical>
        )}
        {engineCR?.spec?.appinfo?.appns !== undefined && (
          <Layout.Vertical margin={{ top: 'medium', bottom: 'medium' }} spacing="xsmall">
            <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('appNameSpace')}</Text>
            <DropDown
              width={'50%'}
              placeholder={getString('selectAppNamespace')}
              items={getAppNamespaceItems()}
              value={targetApp?.appns}
              onChange={selectedItem => {
                const tmp = { ...targetApp, appns: selectedItem.label, applabel: '' };
                setTargetApp(tmp);
                if (engineCR?.spec?.appinfo?.appns !== undefined) engineCR.spec.appinfo.appns = selectedItem.label;
                setFaultData(faultData => {
                  if (faultData?.faultName) return { ...faultData, engineCR: faultData?.engineCR };
                });
              }}
            />
          </Layout.Vertical>
        )}
        {engineCR?.spec?.appinfo?.applabel !== undefined && (
          <Layout.Vertical margin={{ top: 'medium', bottom: 'medium' }} spacing="xsmall">
            <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('appLabel')}</Text>
            <DropDown
              width={'50%'}
              placeholder={getString('selectAppLabel')}
              items={getAppLabelItems()}
              value={targetApp?.applabel}
              onChange={selectedItem => {
                const tmp = {
                  ...targetApp,
                  applabel: selectedItem.label
                };
                setTargetApp(tmp);
                if (engineCR?.spec?.appinfo?.applabel !== undefined)
                  engineCR.spec.appinfo.applabel = selectedItem.label;
                setFaultData(faultData => {
                  if (faultData?.faultName) return { ...faultData, engineCR: faultData?.engineCR };
                });
              }}
            />
          </Layout.Vertical>
        )}
      </Container>
    </Layout.Vertical>
  );
}
