import React from 'react';
import { Layout, Text, ExpandingSearchInput } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import Drawer from '@components/Drawer';
import { DrawerTypes } from '@components/Drawer/Drawer';
import type { ChaosHub, Chart } from '@api/entities';
import ExperimentCreationChaosFaultsController from '@controllers/ExperimentCreationChaosFaults';
import { useStrings } from '@strings';
import type { ListFaultResponse, ListFaultsRequest } from '@api/core';
import type { FaultData } from '@models';
import type { LazyQueryFunction } from '@api/types';
import ExperimentCreationListHubsView from './ExperimentCreationListHubs';

interface ExperimentCreationSelectFaultViewProps {
  chaoshubs: ChaosHub[] | undefined;
  isOpen: boolean;
  onSelect: (data: FaultData) => void;
  onClose: () => void;
  loading: {
    listChaosHub: boolean;
    listChaosFaults: boolean;
  };
  chaosCharts: Chart[] | undefined;
  listChaosFaultsQuery: LazyQueryFunction<ListFaultResponse, ListFaultsRequest>;
}

export default function ExperimentCreationSelectFaultView({
  isOpen,
  onSelect,
  onClose,
  chaoshubs,
  loading,
  chaosCharts,
  listChaosFaultsQuery
}: ExperimentCreationSelectFaultViewProps): React.ReactElement {
  const { getString } = useStrings();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedHub, setSelectedHub] = React.useState<ChaosHub | undefined>();

  React.useEffect(() => {
    setSelectedHub(chaoshubs?.find(hub => hub.isDefault) || chaoshubs?.[0]);
  }, [chaoshubs]);

  return (
    <Drawer
      isOpen={isOpen}
      leftPanel={
        <ExperimentCreationChaosFaultsController
          onSelect={onSelect}
          selectedHub={selectedHub}
          chaosCharts={chaosCharts}
          loading={loading}
          searchParam={searchQuery}
        />
      }
      rightPanel={
        <ExperimentCreationListHubsView
          chaoshubs={chaoshubs}
          selectedHub={selectedHub}
          setSelectedHub={setSelectedHub}
          chaosCharts={chaosCharts}
          loading={{
            listChaosHub: loading.listChaosHub
          }}
          clearSearchQuery={() => setSearchQuery('')}
          listChaosFaultsQuery={listChaosFaultsQuery}
        />
      }
      handleClose={onClose}
      title={
        <Layout.Horizontal flex width="calc(100% - 356px)">
          <Text font={{ variation: FontVariation.H5 }}>{getString('chaosFaults')}</Text>
          <ExpandingSearchInput
            placeholder={getString('searchForChaosFaults')}
            onChange={e => setSearchQuery(e)}
            flip
          />
        </Layout.Horizontal>
      }
      type={DrawerTypes.ChaosHub}
    />
  );
}
