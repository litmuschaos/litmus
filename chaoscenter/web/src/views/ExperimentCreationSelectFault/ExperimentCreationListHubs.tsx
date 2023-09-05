import React from 'react';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import cx from 'classnames';
import type { ChaosHub, Chart } from '@api/entities';
import { useStrings } from '@strings';
import Loader from '@components/Loader';
import type { LazyQueryFunction } from '@api/types';
import type { ListFaultResponse, ListFaultsRequest } from '@api/core';
import { getScope } from '@utils';
import css from './ExperimentCreationListHubs.module.scss';

interface ExperimentCreationListHubsViewProps {
  chaoshubs: ChaosHub[] | undefined;
  selectedHub: ChaosHub | undefined;
  setSelectedHub: React.Dispatch<React.SetStateAction<ChaosHub | undefined>>;
  chaosCharts: Chart[] | undefined;
  loading: {
    listChaosHub: boolean;
  };
  clearSearchQuery: () => void;
  listChaosFaultsQuery: LazyQueryFunction<ListFaultResponse, ListFaultsRequest>;
}

export default function ExperimentCreationListHubsView({
  chaoshubs,
  selectedHub,
  setSelectedHub,
  chaosCharts,
  loading,
  clearSearchQuery,
  listChaosFaultsQuery
}: ExperimentCreationListHubsViewProps): React.ReactElement {
  const { getString } = useStrings();
  const scope = getScope();

  React.useEffect(() => {
    if (selectedHub?.id)
      listChaosFaultsQuery({
        variables: {
          projectID: scope.projectID,
          hubID: selectedHub.id
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHub?.id]);

  return (
    <Layout.Vertical height={'100%'}>
      <Layout.Horizontal className={css.headContainer} flex={{ justifyContent: 'flex-start' }}>
        <Icon color={Color.WHITE} className={css.spaceRight} name="template-library" size={15} />
        <Text color={Color.WHITE} font={{ variation: FontVariation.H5 }}>
          {getString('faultsLibrary')}
        </Text>
      </Layout.Horizontal>
      <Layout.Vertical height={'100%'}>
        <Loader loading={loading.listChaosHub} color={Color.WHITE} small>
          {chaoshubs && (
            <div className={css.allHubs}>
              {chaoshubs.map(chaoshub => {
                return (
                  <div key={chaoshub.id}>
                    <div
                      onClick={() => {
                        listChaosFaultsQuery({
                          variables: {
                            projectID: scope.projectID,
                            hubID: chaoshub.id
                          }
                        });
                        setSelectedHub(chaoshub);
                        clearSearchQuery();
                      }}
                      className={cx(css.hub, { [css.active]: selectedHub?.name === chaoshub.name })}
                    >
                      <Text
                        icon="briefcase"
                        font={{ size: 'normal', weight: 'semi-bold' }}
                        style={{ cursor: 'pointer' }}
                        color={Color.WHITE}
                      >
                        {chaoshub.name}
                      </Text>
                    </div>
                    <Container className={css.leftSpacing}>
                      {selectedHub === chaoshub &&
                        chaosCharts?.map(
                          chart =>
                            chart.spec.faults.length > 0 && (
                              <Text
                                className={css.category}
                                font={{ size: 'normal', weight: 'light' }}
                                color={Color.GREY_200}
                                onClick={() => {
                                  clearSearchQuery();
                                  window.setTimeout(
                                    () =>
                                      document
                                        .getElementById(chart.metadata.name)
                                        ?.scrollIntoView({ behavior: 'smooth' }),
                                    100 /* Using timeout to stop the execution thread for a 100ms because after 
                                  clearSearchQuery() is called it takes a moment to bring back the data */
                                  );
                                }}
                              >
                                {`${chart.spec.displayName} (${chart.spec.faults.length})`}
                              </Text>
                            )
                        )}
                    </Container>
                  </div>
                );
              })}
            </div>
          )}
        </Loader>
      </Layout.Vertical>
    </Layout.Vertical>
  );
}
