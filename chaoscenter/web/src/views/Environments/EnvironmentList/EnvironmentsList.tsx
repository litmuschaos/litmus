import React, { useMemo } from 'react';
import { Layout, TableV2, useToggleOpen, Dialog } from '@harnessio/uicore';
import type { Column, Row } from 'react-table';
import { useHistory } from 'react-router-dom';
import type { MutationFunction } from '@apollo/client';
import { useStrings } from '@strings';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import type {
  CreateEnvironmentRequest,
  CreateEnvironmentResponse,
  DeleteEnvironmentRequest,
  UpdateEnvironmentRequest
} from '@api/core/environments';
import DefaultLayout from '@components/DefaultLayout';
import { useDocumentTitle, useRouteWithBaseUrl } from '@hooks';
import Loader from '@components/Loader';
import type {
  EnvironmentDetails,
  EnvironmentDetailsTableProps,
  RefetchEnvironments
} from '@controllers/Environments/types';
import CreateEnvironment from './CreateEnvironment';
import { MenuCell } from './EnvironmentsTableMenu';
import { EnvironmentName, EnvironmentTypes, LastUpdatedBy } from '../EnvironmentsListColumns/EnvironmentsListColumns';
import css from './EnvironmentsList.module.scss';

interface EnvironmentListViewProps {
  environmentTableData: EnvironmentDetailsTableProps | undefined;
  loading: {
    listEnvironments: boolean;
  };
  mutation: {
    createEnvironment: MutationFunction<CreateEnvironmentResponse, CreateEnvironmentRequest>;
    updateEnvironment: MutationFunction<string, UpdateEnvironmentRequest>;
    deleteEnvironment: MutationFunction<string, DeleteEnvironmentRequest>;
  };
}

export default function EnvironmentListView({
  loading,
  environmentTableData,
  refetchEnvironments,
  mutation
}: EnvironmentListViewProps & RefetchEnvironments): React.ReactElement {
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { isOpen, open, close } = useToggleOpen();

  useDocumentTitle(getString('environments'));

  const envColumns: Column<EnvironmentDetails>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '40%',
        accessor: 'name',
        Cell: EnvironmentName
      },
      {
        Header: getString('type').toUpperCase(),
        id: 'type',
        accessor: 'type',
        width: '30%',
        Cell: EnvironmentTypes
      },
      {
        Header: getString('lastUpdatedBy').toUpperCase(),
        id: 'modifiedBy',
        width: '30%',
        Cell: LastUpdatedBy
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row }: { row: Row<EnvironmentDetails> }) => <MenuCell row={{ ...row, refetchEnvironments }} />,
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <DefaultLayout
      title={getString('environments')}
      breadcrumbs={[]}
      subHeader={
        <Layout.Horizontal flex={{ distribution: 'space-between' }}>
          <Layout.Horizontal>
            <RbacButton
              intent="primary"
              data-testid="add-environment"
              icon="plus"
              iconProps={{ size: 10 }}
              text={getString('newEnvironment')}
              permission={PermissionGroup.EDITOR}
              onClick={() => open()}
            />
            {isOpen && (
              <Dialog
                isOpen={isOpen}
                canOutsideClickClose={false}
                canEscapeKeyClose={false}
                onClose={() => close()}
                isCloseButtonShown
                className={css.dialogStylesEnv}
              >
                <CreateEnvironment
                  closeModal={close}
                  mutation={{
                    createEnvironment: mutation.createEnvironment,
                    updateEnvironment: mutation.updateEnvironment
                  }}
                />
              </Dialog>
            )}
          </Layout.Horizontal>
        </Layout.Horizontal>
      }
    >
      <Loader
        loading={loading.listEnvironments}
        noData={{
          when: () => environmentTableData === null,
          messageTitle: getString('noEnvironmentFound'),
          message: getString('noEnvironmentFoundMessage')
        }}
      >
        <TableV2<EnvironmentDetails>
          columns={envColumns}
          sortable
          onRowClick={rowDetails =>
            rowDetails.environmentID &&
            history.push({
              pathname: paths.toKubernetesChaosInfrastructures({ environmentID: rowDetails.environmentID })
            })
          }
          data={environmentTableData?.content ?? []}
          pagination={environmentTableData?.pagination}
        />
      </Loader>
    </DefaultLayout>
  );
}
