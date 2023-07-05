import React from 'react';
import { ExpandingSearchInput, Layout, MultiSelectDropDown, MultiSelectOption, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { getScope } from '@utils';
import { listChaosHub } from '@api/core';
import type { ExperimentManifest } from '@models';
import Loader from '@components/Loader';
import { useStrings } from '@strings';
import FallbackBox from '@images/FallbackBox.svg';
import ListPredefinedExperimentsController from '@controllers/ListPredefinedExperiments';
import css from './ListChaosHubsTab.module.scss';

interface ListChaosHubsTabControllerProps {
  onClose: (manifest: ExperimentManifest) => void;
}

export interface CustomizedMultiSelectOption extends MultiSelectOption {
  isDefault: boolean;
  value: string;
}

export default function ListChaosHubsTabController({ onClose }: ListChaosHubsTabControllerProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const [selectedOptions, setSelectedOptions] = React.useState<CustomizedMultiSelectOption[]>([]);
  const [itemsList, setItemsList] = React.useState<CustomizedMultiSelectOption[]>([]);
  const [searchText, setSearchText] = React.useState<string>('');

  const { data: chaosHubsList, loading } = listChaosHub({
    ...scope,
    options: {
      onCompleted: result => {
        const chaosHubs: CustomizedMultiSelectOption[] =
          result.listChaosHub?.map(chaosHub => {
            return {
              value: chaosHub.id,
              label: chaosHub.name,
              isDefault: chaosHub.isDefault
            };
          }) ?? [];
        setItemsList(chaosHubs);
        setSelectedOptions(chaosHubs);
      }
    }
  });

  return (
    <Layout.Vertical height={'100%'} style={{ gap: '1.5rem' }}>
      <Layout.Horizontal flex>
        <ExpandingSearchInput
          className={css.searchInput}
          alwaysExpanded
          placeholder="Search"
          onChange={text => setSearchText(text.trim())}
        />
        <MultiSelectDropDown
          width={175}
          placeholder={getString('experimentType')}
          items={itemsList}
          value={selectedOptions}
          onChange={selectedItems => {
            setSelectedOptions(selectedItems as CustomizedMultiSelectOption[]);
          }}
        />
      </Layout.Horizontal>
      <Loader
        className={css.loader}
        loading={loading}
        noData={{
          when: () => chaosHubsList?.listChaosHub?.length === 0,
          messageTitle: getString('noData.title'),
          message: getString('noData.message')
        }}
      >
        <Layout.Vertical height={'100%'} style={{ gap: '1.5rem' }}>
          {selectedOptions?.length > 0 ? (
            selectedOptions.map(selectedOption => (
              <ListPredefinedExperimentsController
                key={selectedOption.label}
                hub={selectedOption}
                onClose={onClose}
                searchText={searchText}
              />
            ))
          ) : (
            <Layout.Vertical
              flex={{ alignItems: 'center', justifyContent: 'center' }}
              width={'100%'}
              height={'100%'}
              spacing="xlarge"
            >
              <img src={FallbackBox} alt="searchEmptyState" />
              <Text font={{ variation: FontVariation.H5, weight: 'light' }} color={Color.GREY_600}>
                {getString('noChaosHubSelected')}
              </Text>
            </Layout.Vertical>
          )}
        </Layout.Vertical>
      </Loader>
    </Layout.Vertical>
  );
}
