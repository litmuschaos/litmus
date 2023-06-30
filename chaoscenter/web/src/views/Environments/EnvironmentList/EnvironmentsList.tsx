import React, { useMemo } from 'react';
import { Layout, Container, TableV2 } from '@harness/uicore';
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
import { useRouteWithBaseUrl } from '@hooks';
import CreateEnvironment from './CreateEnvironment';
import type {
  EnvironmentDetails,
  EnvironmentDetailsTableProps,
  RefetchEnvironments
} from '../../../controllers/Environments/types';
import { EnvironmentName, EnvironmentTypes, LastUpdatedBy } from '../EnvironmentsListColumns/EnvironmentsListColumns';
import { MenuCell } from './EnvironmentsTableMenu';

interface EnvironmentListViewProps {
  environmentTableData: EnvironmentDetailsTableProps | undefined;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean;
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
  setIsModalOpen,
  isModalOpen,
  mutation
}: EnvironmentListViewProps & RefetchEnvironments): React.ReactElement {
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();

  const envColumns: Column<EnvironmentDetails>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '40%',
        accessor: 'name',
        Cell: EnvironmentName
      },
      // {
      //   Header: 'Description',
      //   id: 'description',
      //   accessor: 'description',
      //   width: '35%',
      //   Cell: EnvironmentDescription
      // },
      {
        Header: 'TYPE',
        id: 'type',
        accessor: 'type',
        width: '30%',
        Cell: EnvironmentTypes
      },
      {
        Header: 'LAST UPDATED BY',
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
    [getString]
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
              text="New Environment"
              permission={PermissionGroup.EDITOR}
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      }
      // error={error}
      // retryOnError={refetchEnvironments}
      loading={loading.listEnvironments}
    >
      {isModalOpen && (
        <CreateEnvironment
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          mutation={{ createEnvironment: mutation.createEnvironment, updateEnvironment: mutation.updateEnvironment }}
        />
      )}
      {true && (
        <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
          <TableV2<EnvironmentDetails>
            columns={envColumns}
            sortable
            onRowClick={rowDetails =>
              rowDetails.environmentID &&
              history.push({
                pathname: paths.toKubernetesChaosInfrastructures({ environmentID: rowDetails.environmentID })
                // search: `tab=${StudioTabs.BUILDER}`
              })
            }
            data={environmentTableData?.content ?? []}
            pagination={environmentTableData?.pagination}
          />
        </Container>
      )}
      {/* {emptyEnvs && (
          <Container flex={{ align: 'center-center' }} height="100%">
            <Container flex style={{ flexDirection: 'column' }}>
              <img src={EmptyContent} width={220} height={220} />
              <Heading className={css.noEnvHeading} level={2}>
                {getString('cd.noEnvironment.title')}
              </Heading>
              <Text className={css.noEnvText}>{getString('cd.noEnvironment.message')}</Text>
            </Container>
          </Container>
        )} */}
    </DefaultLayout>
  );
}
