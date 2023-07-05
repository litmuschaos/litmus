import React from 'react';
import { Container, Layout, Tabs, ExpandingSearchInput, ExpandingSearchInputHandle } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import type { TabId } from '@blueprintjs/core';
import type { ApolloError } from '@apollo/client';
import { useParams } from 'react-router-dom';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import type { PredefinedExperiment } from '@api/entities';
import { useStrings } from '@strings';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import { getScope } from '@utils';
import { GenericErrorHandler } from '@errors';
import type { ListFaultResponse } from '@api/core';
import ChaosFaults from './ChaosFaults';
import PredefinedExperiments from './PredefinedExperiments';

interface ChaosHubViewParams {
  predefinedExperiments?: PredefinedExperiment[];
  hubDetails?: ListFaultResponse;
  categories: {
    predefinedCategories: Map<string, number>;
    faultCategories: Map<string, number>;
  };
  loading: {
    listPredefinedExperiment: boolean;
    listChart: boolean;
  };
  listChartError: ApolloError | undefined;
}

export default function ChaosHubView({
  hubDetails,
  categories,
  predefinedExperiments,
  loading,
  listChartError
}: ChaosHubViewParams): React.ReactElement {
  const paths = useRouteWithBaseUrl();
  const scope = getScope();
  const searchParams = useSearchParams();
  const { getString } = useStrings();
  const hubName = searchParams.get('hubName') ?? getString('chaosHub');
  const { hubID } = useParams<{ hubID: string }>();

  const [activeTab, setActiveTab] = React.useState<TabId>('chaosExperiments');
  const [searchValue, setSearchValue] = React.useState<string>('');
  const searchBarRef = React.useRef<ExpandingSearchInputHandle | undefined>(null);

  const breadcrumbs = [
    {
      label: getString('chaoshubs'),
      url: paths.toChaosHubs()
    }
  ];

  const HUB_NOT_EXIST_ERROR_MESSAGE = 'mongo: no documents in result';

  if (
    !loading.listChart &&
    !loading.listPredefinedExperiment &&
    listChartError?.message === HUB_NOT_EXIST_ERROR_MESSAGE
  ) {
    return (
      <GenericErrorHandler
        errStatusCode={400}
        errorMessage={getString('genericResourceNotFoundError', {
          resource: getString('chaosHub'),
          resourceID: hubID,
          projectID: scope.projectID
        })}
      />
    );
  }
  // TODO: <!-- disabled due to API sending error of empty directory in case of no faults in the hub-->

  // if (!loading.listChart && !loading.listPredefinedExperiment && listChartError) {
  //   return <GenericErrorHandler errStatusCode={500} errorMessage={listChartError?.message} />;
  // }

  return (
    <DefaultLayoutTemplate title={hubName} breadcrumbs={breadcrumbs} noPadding>
      <Layout.Vertical width={'100%'} background={Color.WHITE} height="calc(100vh - 80px)">
        <Layout.Horizontal padding={{ left: 'medium', right: 'medium' }} flex={{ alignItems: 'baseline' }}>
          <Tabs
            id={'horizontalTabs'}
            defaultSelectedTabId={activeTab}
            onChange={tabId => {
              setSearchValue('');
              if (searchBarRef.current) {
                searchBarRef.current.clear();
              }
              setActiveTab(tabId);
            }}
            tabList={[
              {
                id: 'chaosExperiments',
                title: (
                  <>
                    {getString('chaosExperiments')} (
                    {loading.listPredefinedExperiment ? (
                      <Icon name="steps-spinner" size={14} color={Color.GREY_600} style={{ alignSelf: 'center' }} />
                    ) : predefinedExperiments ? (
                      predefinedExperiments.length
                    ) : (
                      0
                    )}
                    )
                  </>
                )
              },
              {
                id: 'chaosFaults',
                title: (
                  <>
                    {getString('chaosFaults')} (
                    {loading.listChart ? (
                      <Icon name="steps-spinner" size={14} color={Color.GREY_600} style={{ alignSelf: 'center' }} />
                    ) : hubDetails?.listChaosFaults
                        .map(chart => chart.spec.faults.length)
                        .reduce((a, b) => a + b, 0) === undefined ? (
                      0
                    ) : (
                      hubDetails?.listChaosFaults.map(chart => chart.spec.faults.length).reduce((a, b) => a + b, 0)
                    )}
                    )
                  </>
                )
              }
            ]}
          />
          <Container padding={{ top: 'xsmall', bottom: 'xsmall' }}>
            <ExpandingSearchInput ref={searchBarRef} width={300} onChange={e => setSearchValue(e)} alwaysExpanded />
          </Container>
        </Layout.Horizontal>
        <Container width="100%" border={{ top: true }}>
          {activeTab === 'chaosExperiments' ? (
            <PredefinedExperiments
              predefinedCategories={categories.predefinedCategories}
              predefinedExperiments={predefinedExperiments}
              loading={{ listPredefinedExperiment: loading.listPredefinedExperiment }}
              searchValue={searchValue}
            />
          ) : (
            <ChaosFaults
              faultCategories={categories.faultCategories}
              hubDetails={hubDetails}
              loading={{ listChart: loading.listChart }}
              searchValue={searchValue}
            />
          )}
        </Container>
      </Layout.Vertical>
    </DefaultLayoutTemplate>
  );
}
