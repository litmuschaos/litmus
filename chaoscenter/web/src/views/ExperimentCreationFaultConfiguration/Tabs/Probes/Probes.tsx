import React from 'react';
import { Container, Layout, TableV2, Text, useToaster } from '@harness/uicore';
import { Color, FontVariation } from '@harness/design-system';
import { PopoverInteractionKind } from '@blueprintjs/core';
import type { FaultData, ProbeAttributes } from '@models';
import Options from '@components/Options';
import type { StringsMap } from 'strings/types';
import DarkPopover from '@components/DarkPopover';
import { useStrings } from '@strings';
import ProbeInformationCard, { ProbeInformationType } from '@components/ProbeInformationCard';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import SearchEmptyState from '@images/SearchEmptyState.png';
import { AddProbeStepWizard } from './AddProbeStepWizard/AddProbeStepWizard';
import css from './Probes.module.scss';

interface MenuItemProps {
  expName: string | undefined;
  probe: ProbeAttributes;
  length: number;
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>;
}

const MenuItem = ({ expName, probe, length, setProbeData }: MenuItemProps): React.ReactElement => {
  const { showError } = useToaster();
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';

  const setUnsavedChanges = (): void => {
    if (!hasUnsavedChangesInURL) updateSearchParams({ unsavedChanges: 'true' });
  };

  return (
    <Options
      disabled={length === 1}
      handleDelete={() => {
        if (expName && probe.name && length > 1) {
          setProbeData(probes => probes?.filter(p => p.name !== probe.name));
          setUnsavedChanges();
        } else showError(getString('faultShouldHaveAtleastOneProbe'));
      }}
    />
  );
};

const getTableColumns = (
  expName: string | undefined,
  length: number,
  setProbeData: React.Dispatch<React.SetStateAction<ProbeAttributes[] | undefined>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  return [
    {
      Header: 'Probe',
      accessor: (probe: ProbeAttributes) => (
        <Text lineClamp={1} font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
          {probe.name}
        </Text>
      ),
      id: 'probeName',
      width: '20%'
    },
    {
      Header: 'Type',
      accessor: (probe: ProbeAttributes) => (
        <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{probe.type}</Text>
      ),
      id: 'probeType',
      width: '19%'
    },
    {
      Header: 'Mode',
      accessor: (probe: ProbeAttributes) => (
        <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{probe.mode}</Text>
      ),
      id: 'probeMode',
      width: '20%'
    },
    {
      Header: 'Probe Details',
      accessor: (probe: ProbeAttributes) => (
        <Layout.Horizontal padding={{ left: 'large' }}>
          <DarkPopover
            interactionKind={PopoverInteractionKind.HOVER}
            content={<ProbeInformationCard display={ProbeInformationType.DETAILS} probe={probe} />}
          >
            <Text
              rightIcon="info"
              rightIconProps={{ size: 12, color: Color.PRIMARY_7 }}
              font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}
              color={Color.PRIMARY_7}
            >
              {getString('view')}
            </Text>
          </DarkPopover>
        </Layout.Horizontal>
      ),
      id: 'Probe Details',
      width: '20%'
    },
    {
      Header: 'Properties',
      accessor: (probe: ProbeAttributes) => (
        <Layout.Horizontal padding={{ left: 'large' }}>
          <DarkPopover
            interactionKind={PopoverInteractionKind.HOVER}
            content={<ProbeInformationCard display={ProbeInformationType.PROPERTIES} probe={probe} />}
          >
            <Text
              rightIcon="info"
              rightIconProps={{ size: 12, color: Color.PRIMARY_7 }}
              font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}
              color={Color.PRIMARY_7}
            >
              {getString('view')}
            </Text>
          </DarkPopover>
        </Layout.Horizontal>
      ),
      id: 'Properties',
      width: '20%'
    },
    {
      Header: '',
      accessor: (probe: ProbeAttributes) => (
        <MenuItem expName={expName} length={length} probe={probe} setProbeData={setProbeData} />
      ),
      id: 'Menu',
      width: '1%'
    }
  ];
};

export default function ProbesTab({
  faultData,
  onSave
}: {
  faultData: FaultData | undefined;
  onSave: (data: Omit<FaultData, 'experimentCR'>) => void;
}): React.ReactElement {
  const { getString } = useStrings();

  const [probeData, setProbeData] = React.useState<ProbeAttributes[] | undefined>(
    faultData?.engineCR?.spec?.experiments[0].spec.probe
  );
  React.useEffect(() => {
    if (probeData) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      faultData.engineCR.spec.experiments[0].spec.probe = probeData;
    }
    if (faultData) onSave({ faultName: faultData.faultName, engineCR: faultData.engineCR });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probeData]);

  return (
    <Container
      padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge', bottom: 'xlarge' }}
      background={Color.PRIMARY_BG}
      height="100%"
    >
      {!probeData || probeData.length === 0 ? (
        <Layout.Vertical
          flex={{ alignItems: 'center', justifyContent: 'center' }}
          width={'100%'}
          height={'100%'}
          spacing="xlarge"
        >
          <img src={SearchEmptyState} alt="searchEmptyState" />
          <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} color={Color.GREY_600}>
            {getString('noProbes')}
          </Text>
          <Text
            style={{ maxWidth: '400px', textAlign: 'center' }}
            font={{ variation: FontVariation.BODY2, weight: 'light' }}
            color={Color.BLACK}
          >
            {getString('noProbeDescription')}
          </Text>
          <AddProbeStepWizard setProbeData={setProbeData} faultData={faultData} />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <TableV2
            columns={getTableColumns(faultData?.faultName, probeData.length, setProbeData, getString)}
            data={probeData}
            className={css.probeTable}
          />
          <AddProbeStepWizard setProbeData={setProbeData} faultData={faultData} />
        </Layout.Vertical>
      )}
    </Container>
  );
}
