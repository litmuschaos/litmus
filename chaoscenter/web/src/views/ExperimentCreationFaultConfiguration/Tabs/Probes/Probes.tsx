import React from 'react';
import { Button, ButtonVariation, Container, Layout, TableV2, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Divider } from '@blueprintjs/core';
import { Icon } from '@harnessio/icons';
import type { Row } from 'react-table';
import type { FaultData } from '@models';
import { useStrings } from '@strings';
import EmptyProbe from '@images/emptyProbe.png';
import type { InfrastructureType, ProbeObj } from '@api/entities';
import { UpdateProbeModal } from '@views/ChaosProbes/UpdateProbeModal';
import { MenuCell } from './MenuCell';
import css from './Probes.module.scss';

export interface EditProbeData {
  name: string;
  infrastructureType: InfrastructureType;
}

const getTableColumns = (
  onSave: (data: Omit<FaultData, 'experimentCR'>) => void,
  setEditProbe: React.Dispatch<React.SetStateAction<EditProbeData | undefined>>,
  faultData: FaultData | undefined
): any => {
  return [
    {
      Header: 'Probes',
      accessor: (probe: ProbeObj) => (
        <Layout.Horizontal>
          <Icon name="chaos-litmuschaos" size={20} margin={{ top: 'small', right: 'medium' }} />
          <Layout.Vertical>
            <Text lineClamp={1} font={{ variation: FontVariation.H6, weight: 'bold' }} color={Color.PRIMARY_7}>
              {probe.name}
            </Text>
            <Text
              lineClamp={1}
              font={{ variation: FontVariation.TINY_SEMI, weight: 'light' }}
              margin={{ top: 'xsmall' }}
              color={Color.GREY_600}
            >
              {`ID: ${probe.name}`}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      ),
      id: 'probeName',
      width: '45%'
    },
    {
      Header: 'Mode',
      accessor: (probe: ProbeObj) => (
        <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{probe.mode}</Text>
      ),
      id: 'probeType',
      width: '45%'
    },
    {
      Header: '',
      id: 'threeDotMenu',
      Cell: ({ row }: { row: Row<ProbeObj> }) => (
        <MenuCell row={row} faultData={faultData} setEditProbe={setEditProbe} onSave={onSave} />
      ),
      disableSortBy: true,
      width: '10px'
    }
  ];
};

export default function ProbesTab({
  faultData,
  onSave,
  setIsAddProbeSelected
}: {
  faultData: FaultData | undefined;
  setIsAddProbeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (data: Omit<FaultData, 'experimentCR'>) => void;
}): React.ReactElement {
  const { getString } = useStrings();
  const [editProbe, setEditProbe] = React.useState<EditProbeData | undefined>();

  return (
    <Container
      padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge', bottom: 'xlarge' }}
      background={Color.PRIMARY_BG}
      height="100%"
    >
      {!faultData?.probes || faultData.probes.length === 0 ? (
        <Layout.Vertical
          flex={{ alignItems: 'center', justifyContent: 'center' }}
          width={'100%'}
          height={'100%'}
          spacing="xlarge"
        >
          <img src={EmptyProbe} alt="empty probe" />
          <Text font={{ variation: FontVariation.H3, weight: 'semi-bold' }} flex color={Color.GREY_800}>
            {getString('testYour1')}
            <Text
              font={{ variation: FontVariation.H3, weight: 'semi-bold' }}
              margin={{ left: 'small', right: 'small' }}
              flex
              color={Color.BLUE_700}
            >
              {getString('hypothesis')}
            </Text>
            {getString('testYour2')}
          </Text>
          <Text
            style={{ maxWidth: '400px', textAlign: 'center' }}
            font={{ variation: FontVariation.BODY2, weight: 'light' }}
            color={Color.BLACK}
          >
            {getString('noProbeDescription')}
          </Text>
          <Button
            icon="plus"
            variation={ButtonVariation.PRIMARY}
            text={getString('selectProbe')}
            onClick={() => setIsAddProbeSelected(true)}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Text
            style={{ maxWidth: '400px' }}
            font={{ variation: FontVariation.BODY2, weight: 'bold' }}
            color={Color.BLACK}
          >
            {getString('selectedProbe')}
          </Text>
          <TableV2
            columns={getTableColumns(onSave, setEditProbe, faultData)}
            data={faultData.probes as ProbeObj[]}
            className={css.probeTable}
          />
          <Divider className={css.divider} />
          <div className={css.newProbeCard} onClick={() => setIsAddProbeSelected(true)}>
            <Layout.Horizontal spacing={'xsmall'}>
              <div className={css.plusIcon}>
                <Icon size={35} name="plus" color={Color.WHITE} />
              </div>
              <Layout.Vertical spacing={'xsmall'}>
                <Text color={Color.GREY_800} font={{ variation: FontVariation.H5 }}>
                  {getString('addNewProbes')}
                </Text>
                <Text color={Color.GREY_400} font={{ variation: FontVariation.BODY2, weight: 'light' }}>
                  {getString('addNewCustomizedProbes')}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          </div>
          {editProbe && (
            <UpdateProbeModal
              isOpen={!!editProbe.name}
              hideDarkModal={() => setEditProbe(undefined)}
              probeName={editProbe.name}
              infrastructureType={editProbe.infrastructureType}
            />
          )}
        </Layout.Vertical>
      )}
    </Container>
  );
}
