/* eslint-disable */

import React from 'react';
import { listPredefinedExperiment } from '@api/core';
import { getScope } from '@utils';
import ListPredefinedExperimentsView from '@views/ListPredefinedExperiments';
import type { ExperimentManifest } from '@models';
import Loader from '@components/Loader';
import type { PredefinedExperiment } from '@api/entities';
import { parse } from 'yaml';
import { useStrings } from '@strings';
import { Container, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import type { CustomizedMultiSelectOption } from '@controllers/ListChaosHubsTab';

interface ListPredefinedExperimentsControllerProps {
  hub: CustomizedMultiSelectOption;
  onClose: (manifest: ExperimentManifest) => void;
  searchText: string;
}

export default function ListPredefinedExperimentsController({
  onClose,
  searchText,
  hub
}: ListPredefinedExperimentsControllerProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const [filteredPredefinedExperiments, setFilteredPredefinedExperiments] = React.useState<PredefinedExperiment[]>([]);

  const { data: predefinedExperiments, loading } = listPredefinedExperiment({
    ...scope,
    hubID: hub.value,
    options: { onError: error => console.error(error) }
  });
  React.useEffect(() => {
    if (predefinedExperiments?.listPredefinedExperiments) {
      if (searchText.replace(/\s\s+/g, '') === '')
        setFilteredPredefinedExperiments(predefinedExperiments.listPredefinedExperiments);
      else {
        setFilteredPredefinedExperiments(
          predefinedExperiments.listPredefinedExperiments.filter(predefinedExperiment => {
            return parse(predefinedExperiment.experimentCSV)
              .spec.displayName.toLowerCase()
              .includes(searchText.replace(/\s\s+/g, ' ').toLowerCase());
          })
        );
      }
    }
  }, [predefinedExperiments, searchText]);

  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{ minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xlarge))' : 'initial' }}
    >
      {filteredPredefinedExperiments.length !== 0 ? (
        <ListPredefinedExperimentsView
          hub={hub}
          predefinedExperiments={filteredPredefinedExperiments}
          onClose={onClose}
        />
      ) : (
        <Container padding={{ top: 'small', bottom: 'small' }}>
          <Text font={{ variation: FontVariation.H3, weight: 'semi-bold' }}>{hub.label}</Text>
          <Container
            margin={{ top: 'small' }}
            intent="warning"
            padding="small"
            background="primarybg"
            flex
            border={{
              color: 'yellow500'
            }}
          >
            <Text font={'small'}>{getString('predefinedExperimentsNotFound')}</Text>
          </Container>
        </Container>
      )}
    </Loader>
  );
}
