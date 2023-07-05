import type { ApolloError, MutationFunction } from '@apollo/client';
import { Color, FontVariation } from '@harnessio/design-system';
import { Button, Container, ExpandingSearchInput, FlexExpander, Layout, Page, Text } from '@harnessio/uicore';
import React from 'react';
import deployAgent from '@images/deployAgent.svg';
import noFilteredData from '@images/noFilteredData.svg';
import { useStrings } from '@strings';
import type { KubernetesChaosInfrastructure } from '@api/entities';
import type { DeleteKubernetesChaosInfraRequest, DeleteKubernetesChaosInfraResponse } from '@api/core';
import Loader from '@components/Loader';
import ChaosInfrastructureHeader from '@components/ChaosInfrastructureHeader';
import KubernetesChaosInfrastructureTableView from '@views/KubernetesChaosInfrastructureTable';
import type { GetEnvironmentResponse } from '@api/core/environments';
import { useRouteWithBaseUrl } from '@hooks';
import KubernetesChaosInfrastructureCreationModalView from '../KubernetesChaosInfrastructureCreationModal/KubernetesChaosInfrastructureCreationModal';
import css from './KubernetesChaosInfrastructure.module.scss';

interface KubernetesChaosInfrastructureViewProps {
  chaosInfrastructures: Array<KubernetesChaosInfrastructure> | undefined;
  environmentDetails: GetEnvironmentResponse | undefined;
  loading: {
    listChaosInfrastructure: boolean;
    getEnvironmentLoading: boolean;
  };
  error: {
    getEnvironmentError: ApolloError | undefined;
    listChaosInfrastructureError: ApolloError | undefined;
  };
  environmentID: string;
  deleteChaosInfrastructureMutation: MutationFunction<
    DeleteKubernetesChaosInfraResponse,
    DeleteKubernetesChaosInfraRequest
  >;
  startPolling: (pollInterval: number) => void;
  stopPolling: () => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalInfrastructures: number;
  pagination: React.ReactElement;
}

export default function KubernetesChaosInfrastructureView({
  chaosInfrastructures,
  environmentDetails,
  loading,
  environmentID,
  deleteChaosInfrastructureMutation,
  startPolling,
  stopPolling,
  searchTerm,
  setSearchTerm,
  totalInfrastructures,
  pagination
}: KubernetesChaosInfrastructureViewProps): React.ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  // if (error.getEnvironmentError?.response?.status === 400) {
  //   return (
  //     <GenericErrorHandler
  //       errStatusCode={400}
  //       errorMessage={getString('genericResourceNotFoundError', {
  //         resource: getString('environment'),
  //         resourceID: environmentDetails?.environment?.name ?? environmentID,
  //         projectID: scope.projectID
  //       })}
  //     />
  //   );
  // }

  // if (error.getEnvironmentError !== undefined || error.listChaosInfrastructureError !== undefined) {
  //   return (
  //     <GenericErrorHandler
  //       errStatusCode={error.getEnvironmentError?.response?.status}
  //       errorMessage={error.getEnvironmentError?.message}
  //     />
  //   );
  // }

  const subHeader = (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
      <Layout.Horizontal spacing="medium">
        <KubernetesChaosInfrastructureCreationModalView stopPolling={stopPolling} startPolling={startPolling} />
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        <ExpandingSearchInput
          defaultValue={searchTerm}
          alwaysExpanded
          width={280}
          placeholder={getString('search')}
          throttle={500}
          onChange={query => {
            setSearchTerm(query.trim());
          }}
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  );

  const numberOfChaosInfrastructures = totalInfrastructures;
  const breadcrumbs = [
    {
      label: getString('environments'),
      url: paths.toEnvironments()
    }
  ];
  return (
    <ChaosInfrastructureHeader
      title={`[${environmentID}] Chaos Infrastructures`}
      breadcrumbs={breadcrumbs}
      environmentData={{
        environmentID: environmentID,
        environmentType: environmentDetails?.getEnvironment.type,
        environmentName: environmentDetails?.getEnvironment?.name,
        environmentDescription: environmentDetails?.getEnvironment?.description,
        environmentTags: environmentDetails?.getEnvironment?.tags
      }}
      createdAt={parseInt(environmentDetails?.getEnvironment.createdAt ?? '')}
      updatedAt={parseInt(environmentDetails?.getEnvironment.updatedAt ?? '')}
    >
      <Layout.Horizontal className={css.fullWidth}>
        <Layout.Vertical style={{ display: 'flex', flexGrow: 1, width: 'min-content' }} height={'100%'}>
          {(numberOfChaosInfrastructures > 0 || searchTerm !== '') && (
            <Page.SubHeader className={css.subHeader}>{subHeader}</Page.SubHeader>
          )}
          <Container className={css.scrollContainer}>
            <Loader loading={loading.listChaosInfrastructure}>
              {chaosInfrastructures !== undefined && chaosInfrastructures.length > 0 ? (
                <KubernetesChaosInfrastructureTableView
                  data={chaosInfrastructures}
                  deleteChaosInfrastructureMutation={deleteChaosInfrastructureMutation}
                />
              ) : searchTerm === '' ? (
                <Layout.Vertical
                  flex={{ alignItems: 'center', justifyContent: 'center' }}
                  width={'100%'}
                  height={'100%'}
                  spacing="large"
                >
                  <img src={deployAgent} alt="chaosInfrastructureDeploy" />
                  <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} color={Color.GREY_600}>
                    {getString('noChaosInfrastructure')}
                  </Text>
                  <Text
                    style={{ maxWidth: '547px', textAlign: 'center' }}
                    font={{ variation: FontVariation.BODY1, weight: 'light' }}
                    color={Color.GREY_600}
                  >
                    {getString('chaosInfrastructureDesc')}
                  </Text>
                  <KubernetesChaosInfrastructureCreationModalView
                    stopPolling={stopPolling}
                    startPolling={startPolling}
                  />
                </Layout.Vertical>
              ) : (
                <Layout.Vertical
                  flex={{ alignItems: 'center', justifyContent: 'center' }}
                  width={'100%'}
                  height={'100%'}
                  spacing="large"
                >
                  <img src={noFilteredData} alt="chaosInfrastructureDeploy" />
                  <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} color={Color.GREY_600}>
                    {getString('noResultsFound')}
                  </Text>
                  <Text
                    style={{ maxWidth: '547px', textAlign: 'center' }}
                    font={{ variation: FontVariation.BODY1, weight: 'light' }}
                    color={Color.GREY_600}
                  >
                    {getString('noKubernetesChaosInfrastructureFound', { value: searchTerm })}
                  </Text>
                  <Button
                    icon="reset"
                    minimal
                    color={Color.PRIMARY_7}
                    text="Clear search"
                    onClick={() => setSearchTerm('')}
                  />
                </Layout.Vertical>
              )}
            </Loader>
          </Container>
          <FlexExpander />
          <Container padding={'medium'}>{pagination}</Container>
        </Layout.Vertical>
      </Layout.Horizontal>
    </ChaosInfrastructureHeader>
  );
}
