import { Button, ButtonVariation, DropDown, Layout, SelectOption, TableV2, Text, useToaster } from '@harnessio/uicore';
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
        width: '25%',
        accessor: 'username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'email',
        accessor: 'email',
        width: '25%',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'Role',
        width: '50%',
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
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }} spacing="medium">
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
                <DropDown
                  filterable={false}
                  value={memberRole}
                  items={rolesDropDown}
                  onChange={option => setMemberRole(option.label as 'Editor' | 'Owner' | 'Viewer')}
                />
              </Layout.Horizontal>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="medium">
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
    <Layout.Vertical height={'100%'} padding="medium">
      <Text font={{ variation: FontVariation.H6 }}>Total Pending Invitations: {pendingMembers?.length ?? 0}</Text>
      <Loader
        loading={isLoading}
        noData={{
          when: () => pendingMembers?.length === 0,
          messageTitle: getString('pendingInvitationsNotAvailableTitle'),
          message: getString('pendingInvitationsNotAvailableMessage')
        }}
      >
        {pendingMembers && <TableV2<ProjectMember> columns={envColumns} sortable data={pendingMembers} />}
      </Loader>
    </Layout.Vertical>
  );
}
