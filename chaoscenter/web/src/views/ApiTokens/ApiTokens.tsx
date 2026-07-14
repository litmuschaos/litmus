import { Button, ButtonVariation, Layout, TableV2, Text, useToggleOpen } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import React from 'react';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { Dialog } from '@blueprintjs/core';
import type { ApiToken, ErrorModel, GetApiTokensResponse } from '@api/auth';
import { useStrings } from '@strings';
import Loader from '@components/Loader';
import { getFormattedTime, killEvent } from '@utils';
import DeleteApiTokenController from '@controllers/DeleteApiToken';
import CreateNewTokenController from '@controllers/CreateNewToken';
import CopyButton from '@components/CopyButton';
import css from './ApiTokens.module.scss';

interface ApiTokensViewProps {
  apiTokensData: GetApiTokensResponse | undefined;
  getApiTokensQueryLoading: boolean;
  apiTokensRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetApiTokensResponse, ErrorModel>>;
}

interface MemoizedApiTokensTableProps extends Omit<ApiTokensViewProps, 'apiTokensData' | 'getApiTokensQueryLoading'> {
  apiTokens: ApiToken[];
}

function MemoizedApiTokensTable({ apiTokens, apiTokensRefetch }: MemoizedApiTokensTableProps): React.ReactElement {
  const { getString } = useStrings();

  const columns: Column<ApiToken>[] = React.useMemo(() => {
    return [
      {
        id: 'tokenName',
        Header: getString('name'),
        Cell: ({ row: { original: data } }: { row: Row<ApiToken> }) => {
          return (
            <Layout.Horizontal style={{ gap: '0.25rem' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Icon name="resources" size={20} />
              <Text font={{ variation: FontVariation.BODY }}>{data.name}</Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        id: 'expiresAt',
        Header: getString('expiresAt'),
        Cell: ({ row: { original: data } }: { row: Row<ApiToken> }) => {
          return (
            data.expires_at && (
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getFormattedTime(data.expires_at * 1000)}
              </Text>
            )
          );
        }
      },
      {
        id: 'accessToken',
        Header: getString('value'),
        Cell: ({ row: { original: data } }: { row: Row<ApiToken> }) => {
          return data.token && <CopyButton stringToCopy={data.token} />;
        }
      },
      {
        id: 'removeToken',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<ApiToken> }) => {
          const { isOpen, open, close } = useToggleOpen();
          return (
            <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
              <Button
                key={data.token}
                text={
                  <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.RED_600}>
                    {getString('delete')}
                  </Text>
                }
                variation={ButtonVariation.LINK}
                onClick={() => open()}
              />
              {isOpen && (
                <Dialog
                  isOpen={isOpen}
                  canOutsideClickClose={false}
                  canEscapeKeyClose={false}
                  onClose={() => close()}
                  className={css.nameChangeDialog}
                >
                  <DeleteApiTokenController
                    handleClose={close}
                    apiTokensRefetch={apiTokensRefetch}
                    token={data.token}
                  />
                </Dialog>
              )}
            </Layout.Vertical>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <TableV2<ApiToken> className={css.tableMainContainer} columns={columns} data={apiTokens} sortable />;
}

export default function ApiTokensView(props: ApiTokensViewProps): React.ReactElement {
  const { apiTokensData, getApiTokensQueryLoading, apiTokensRefetch } = props;
  const apiTokens = apiTokensData?.apiTokens ?? [];
  const { getString } = useStrings();
  const { isOpen, open, close } = useToggleOpen();

  return (
    <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} style={{ minHeight: 200 }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H5 }}>
          {getString('apiTokens')} ({apiTokens.length})
        </Text>
        <Button text={getString('newToken')} variation={ButtonVariation.PRIMARY} icon="plus" onClick={() => open()} />
        {isOpen && (
          <Dialog
            isOpen={isOpen}
            canOutsideClickClose={false}
            canEscapeKeyClose={false}
            onClose={() => close()}
            className={css.nameChangeDialog}
          >
            <CreateNewTokenController handleClose={close} apiTokensRefetch={apiTokensRefetch} />
          </Dialog>
        )}
      </Layout.Horizontal>
      <Loader
        small
        loading={getApiTokensQueryLoading}
        noData={{
          when: () => apiTokens?.length === 0,
          message: getString('noApiTokensFound')
        }}
      >
        {apiTokens && <MemoizedApiTokensTable apiTokens={apiTokens} apiTokensRefetch={apiTokensRefetch} />}
      </Loader>
    </Layout.Vertical>
  );
}
