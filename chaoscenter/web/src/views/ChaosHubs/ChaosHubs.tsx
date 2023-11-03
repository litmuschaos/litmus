import type { ApolloQueryResult, MutationFunction } from '@apollo/client';
import { Color, FontVariation } from '@harnessio/design-system';
import { Card, Container, ExpandingSearchInput, Layout, Text, useToaster } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import cx from 'classnames';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { getDetailedTime, getScope } from '@utils';
import { useStrings } from '@strings';
import ChaosHubMenuController from '@controllers/ChaosHubMenu';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import type { ChaosHub } from '@api/entities';
import type { ListChaosHubRequest, ListChaosHubResponse, SyncChaosHubRequest, SyncChaosHubResponse } from '@api/core';
import CustomTagsPopover from '@components/CustomTagsPopover';
import { useDocumentTitle, useRouteWithBaseUrl } from '@hooks';
import NoFilteredData from '@components/NoFilteredData';
import enterpriseHubLogo from '../../images/enterpriseHub.svg';
import privateHubLogo from '../../images/privateHub.svg';
import { AddHubModalProvider } from './AddHubModal';
import css from './ChaosHubs.module.scss';

interface ChaosHubParams {
  chaosHubs?: Array<ChaosHub>;
  syncChaosHubMutation: MutationFunction<SyncChaosHubResponse, SyncChaosHubRequest>;
  loading: {
    listChaosHub: boolean;
    syncChaosHub: boolean;
  };
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  listChaosHubRefetch: (
    variables?: Partial<ListChaosHubRequest> | undefined
  ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }): React.ReactElement {
  const { getString } = useStrings();

  return (
    <div className={css.connectionStatus}>
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="3" cy="3" r="3" fill={isConnected ? '#0AB000' : '#CF2318'} />
      </svg>
      <Text font={{ variation: FontVariation.SMALL }} color={isConnected ? Color.GREY_800 : Color.RED_600}>
        {isConnected ? getString('connected') : getString('disconnected')}
      </Text>
    </div>
  );
}

export const ChaosHubsView: React.FC<ChaosHubParams> = ({
  chaosHubs,
  loading,
  syncChaosHubMutation,
  listChaosHubRefetch,
  searchTerm,
  setSearchTerm
}) => {
  const scope = getScope();
  const { getString } = useStrings();
  const hubID = React.useRef<string | null>(null);
  const paths = useRouteWithBaseUrl();
  const history = useHistory();
  const { showWarning } = useToaster();

  useDocumentTitle(getString('chaoshubs'));

  const subHeader = (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
      <Layout.Horizontal>
        <AddHubModalProvider listChaosHubRefetch={listChaosHubRefetch} />
      </Layout.Horizontal>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
        <ExpandingSearchInput
          alwaysExpanded
          width={280}
          placeholder={getString('searchForHub')}
          defaultValue={searchTerm}
          throttle={500}
          onChange={textQuery => setSearchTerm(textQuery.trim())}
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  );

  return (
    <DefaultLayoutTemplate
      title={getString('chaoshubs')}
      subHeader={subHeader}
      breadcrumbs={[]}
      loading={loading.listChaosHub}
    >
      <Container data-testid="hubContainer" className={css.pageMainContainer}>
        <Text font={{ variation: FontVariation.H6 }}>
          {getString('totalChaosHubs')} {chaosHubs && `(${chaosHubs?.length})`}
        </Text>

        {chaosHubs && chaosHubs.length > 0 ? (
          <Container padding={{ top: 'large', bottom: 'xxlarge' }} className={cx(css.cardsMainContainer)}>
            {chaosHubs.map((chaosHub: ChaosHub) => {
              return (
                <Card className={css.chaosHubCard} interactive key={chaosHub.id}>
                  <ChaosHubMenuController
                    chaosHub={chaosHub}
                    hubID={hubID}
                    isDefault={chaosHub.isDefault}
                    syncChaosHubMutation={syncChaosHubMutation}
                    listChaosHubRefetch={listChaosHubRefetch}
                    loading={{
                      syncChaosHub: loading.syncChaosHub
                    }}
                  />
                  <Layout.Vertical
                    width={200}
                    className={css.card}
                    onClick={async () => {
                      if (!chaosHub.isAvailable) {
                        hubID.current = chaosHub.id;
                        showWarning(getString('chaoshubDisconnectedWillSync'));
                        const result = await syncChaosHubMutation({
                          variables: { projectID: scope.projectID, id: chaosHub.id }
                        });
                        if (!(result.errors === undefined)) return;
                      }
                      history.push({
                        pathname: paths.toChaosHub({ hubID: chaosHub.id }),
                        search: `?hubName=${chaosHub.name}&isDefault=${chaosHub.isDefault}`
                      });
                    }}
                  >
                    <Container>
                      {chaosHub.isDefault ? (
                        <img src={enterpriseHubLogo} height={26.85} width={29} alt="Enterprise Hub" />
                      ) : (
                        <img src={privateHubLogo} height={27.38} width={29} alt="Private Hub" />
                      )}
                      <Text
                        font={{ size: 'medium', weight: 'semi-bold' }}
                        color={Color.BLACK}
                        width="100%"
                        margin={{ top: 'xsmall', bottom: 'xsmall' }}
                      >
                        {chaosHub.name.length > 19 ? chaosHub.name.slice(0, 19) + '...' : chaosHub.name}
                      </Text>
                      <CustomTagsPopover
                        tags={chaosHub.tags ? chaosHub.tags : ['Enterprise', 'ChaosHub']}
                        title={getString('nameIdDescriptionTags.tagsLabel')}
                      />
                    </Container>
                    <Container
                      margin={{ top: 'medium' }}
                      padding={{ top: 'medium', bottom: 'large' }}
                      border={{ top: true }}
                      width="100%"
                    >
                      <ConnectionStatus isConnected={chaosHub.isAvailable} />
                      {!chaosHub.isDefault && (
                        <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="xsmall" margin={{ top: 'small' }}>
                          <Icon
                            name={
                              loading.syncChaosHub && hubID.current === chaosHub.id
                                ? 'syncing'
                                : !chaosHub.isAvailable
                                ? 'not-synced'
                                : 'synced'
                            }
                            size={20}
                          />
                          <Text
                            font={{ variation: FontVariation.SMALL }}
                            color={Color.GREY_600}
                            margin={{ left: 'xsmall' }}
                          >
                            {getString('lastSyncedAt')} {/* TODO: Should be handled by sync time instead */}
                            {getDetailedTime(
                              chaosHub.lastSyncedAt === ''
                                ? chaosHub.updatedAt === ''
                                  ? parseInt(chaosHub.createdAt ?? '0')
                                  : parseInt(chaosHub.updatedAt ?? '0')
                                : parseInt(chaosHub.lastSyncedAt)
                            )}
                          </Text>
                        </Layout.Horizontal>
                      )}
                      <Layout.Horizontal data-testid="details" margin={{ top: 'small' }} spacing="medium">
                        <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.PRIMARY_7}>
                          {getString('faults')}: {chaosHub.totalFaults}
                        </Text>
                        <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.PRIMARY_7}>
                          {getString('experiments')}: {chaosHub.totalExperiments}
                        </Text>
                      </Layout.Horizontal>
                    </Container>
                  </Layout.Vertical>
                  <div
                    data-testid="chip"
                    className={cx(css.chipCard, {
                      [css.default]: chaosHub.isDefault,
                      [css.private]: !chaosHub.isDefault
                    })}
                  >
                    {chaosHub.isDefault ? 'DEFAULT' : 'CUSTOM'}
                  </div>
                </Card>
              );
            })}
          </Container>
        ) : (
          <NoFilteredData />
        )}
      </Container>
    </DefaultLayoutTemplate>
  );
};
