import {
  Button,
  ButtonVariation,
  Container,
  DropDown,
  Layout,
  SelectOption,
  TableV2,
  Text,
  useToaster
} from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import {
  GetProjectMembersOkResponse,
  ProjectMember,
  useRemoveInvitationMutation,
  useSendInvitationMutation
} from '@api/auth';
import Loader from '@components/Loader';
import { MemberEmail, MemberName } from './ActiveMembersListColumns';
import styles from './ProjectMember.module.scss';

interface PendingMembersTableViewProps {
  pendingMembers: ProjectMember[] | undefined;
  isLoading: boolean;
  getPendingMembersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectMembersOkResponse, unknown>>;
}
export default function PendingMembersTableView({
  pendingMembers,
  getPendingMembersRefetch,
  isLoading
}: PendingMembersTableViewProps): React.ReactElement {
  const { getString } = useStrings();

  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'username',
        accessor: 'username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'email',
        accessor: 'email',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'Role',
        disableSortBy: true,
        Cell: ({ row: { original: data } }: { row: Row<ProjectMember> }) => {
          const { projectID } = useParams<{ projectID: string }>();
          const { role } = data;
          const [memberRole, setMemberRole] = React.useState<'Editor' | 'Owner' | 'Viewer'>(role);
          const rolesDropDown: SelectOption[] = [
            {
              label: 'Editor',
              value: 'Editor'
            },
            {
              label: 'Viewer',
              value: 'Viewer'
            }
          ];

          const { showSuccess } = useToaster();
          const { mutate: sendInvitationMutation, isLoading: sendLoading } = useSendInvitationMutation(
            {},
            {
              onSuccess: () => {
                showSuccess(getString('invitationSuccess'));
                getPendingMembersRefetch();
              }
            }
          );

          const { mutate: removeInvitationMutation, isLoading: removeLoading } = useRemoveInvitationMutation(
            {},
            {
              onSuccess: () => {
                showSuccess(getString('invitationRemoveSuccess'));
                getPendingMembersRefetch();
              }
            }
          );

          return (
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <DropDown
                filterable={false}
                value={memberRole}
                items={rolesDropDown}
                onChange={option => setMemberRole(option.label as 'Editor' | 'Owner' | 'Viewer')}
              />
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '1rem' }}>
                <Button
                  disabled={false}
                  loading={sendLoading}
                  onClick={() =>
                    sendInvitationMutation({
                      body: {
                        projectID: projectID,
                        userID: data.userID,
                        role: memberRole
                      }
                    })
                  }
                  variation={ButtonVariation.PRIMARY}
                  text={getString('resend')}
                />
                <Button
                  disabled={false}
                  loading={removeLoading}
                  onClick={() =>
                    removeInvitationMutation({
                      body: {
                        projectID: projectID,
                        userID: data.userID
                      }
                    })
                  }
                  variation={ButtonVariation.SECONDARY}
                  text={getString('remove')}
                />
              </Layout.Horizontal>
            </Layout.Horizontal>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <Container height={'100%'} padding="medium">
      <Loader
        loading={isLoading}
        noData={{
          when: () => pendingMembers?.length === 0,
          messageTitle: getString('pendingInvitationsNotAvailableTitle'),
          message: getString('pendingInvitationsNotAvailableMessage')
        }}
      >
        <Layout.Vertical height="100%" style={{ gap: '0.5rem' }}>
          <Text font={{ variation: FontVariation.H6 }}>
            {getString('totalPendingInvitations')}: {pendingMembers?.length ?? 0}
          </Text>
          <Container style={{ flexGrow: 1 }} className={styles.tableContainerMain}>
            {pendingMembers && <TableV2<ProjectMember> columns={envColumns} sortable data={pendingMembers} />}
          </Container>
        </Layout.Vertical>
      </Loader>
    </Container>
  );
}
