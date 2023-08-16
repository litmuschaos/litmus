import { ButtonVariation, Layout, SplitButton, SplitButtonOption, TableV2, useToaster } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PopoverPosition } from '@blueprintjs/core';
import type { InviteUserDetails } from '@controllers/InviteNewMembers/types';
import { useStrings } from '@strings';
import { GetUsersForInvitationOkResponse, useSendInvitationMutation } from '@api/auth';
import { killEvent } from '@utils';
import { UserEmail, UserName } from './InviteNewMemberListColumns';
import css from './InviteNewMemberTable.module.scss';

interface InviteUsersTableViewProps {
  users: InviteUserDetails[];
  getUsers: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUsersForInvitationOkResponse, unknown>>;
}

export default function InviteUsersTableView({ users, getUsers }: InviteUsersTableViewProps): React.ReactElement {
  const { getString } = useStrings();
  const envColumns: Column<InviteUserDetails>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'username',
        width: '40%',
        Cell: UserName
      },
      {
        Header: 'EMAIL',
        id: 'email',
        width: '30%',
        Cell: UserEmail
      },
      {
        Header: '',
        id: 'threeDotMenu',
        disableSortBy: true,
        Cell: ({ row: { original: data } }: { row: Row<InviteUserDetails> }) => {
          const { projectID } = useParams<{ projectID: string }>();
          const { showSuccess } = useToaster();
          const { mutate: sendInvitationMutation, isLoading } = useSendInvitationMutation(
            {},
            {
              onSuccess: () => {
                showSuccess('Invitation sent successfully');
                getUsers();
              }
            }
          );

          return (
            <Layout.Vertical
              flex={{ justifyContent: 'center', alignItems: 'flex-end' }}
              onClick={killEvent}
              width="100%"
            >
              <SplitButton
                text="Invite as"
                icon="email-inline"
                variation={ButtonVariation.PRIMARY}
                loading={isLoading}
                popoverProps={{
                  interactionKind: 'click',
                  usePortal: true,
                  position: PopoverPosition.BOTTOM_RIGHT
                }}
              >
                <SplitButtonOption
                  text="Editor"
                  onClick={() =>
                    sendInvitationMutation({
                      body: {
                        projectID: projectID,
                        role: 'Editor',
                        userID: data.id
                      }
                    })
                  }
                />
                <SplitButtonOption
                  text="Viewer"
                  onClick={() =>
                    sendInvitationMutation({
                      body: {
                        projectID: projectID,
                        role: 'Viewer',
                        userID: data.id
                      }
                    })
                  }
                />
              </SplitButton>
            </Layout.Vertical>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  );
  return <TableV2 columns={envColumns} data={users} className={css.inviteTable} />;
}
