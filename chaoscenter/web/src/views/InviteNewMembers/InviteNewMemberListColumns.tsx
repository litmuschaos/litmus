import { ButtonVariation, Layout, SplitButton, SplitButtonOption, Text, useToaster } from '@harnessio/uicore';
import type { Row } from 'react-table';
import React from 'react';
import { Color } from '@harnessio/design-system';
import { PopoverPosition } from '@blueprintjs/core';
import { useParams } from 'react-router-dom';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { InviteUserDetails } from '@controllers/InviteNewMembers/types';
import { killEvent } from '@utils';
import { GetUsersForInvitationOkResponse, useSendInvitationMutation } from '@api/auth';

interface MemberRow {
  row: Row<InviteUserDetails>;
}

const UserName = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { Username, ID } = data;
  const { getString } = useStrings();
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{Username}</Text>
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('id')}: {ID}
      </Text>
    </Layout.Vertical>
  );
};

const UserEmail = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { Email } = data;
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{Email}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

export const MenuCell = (
  { row: { original: data } }: { row: Row<InviteUserDetails> },
  getUsersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUsersForInvitationOkResponse, unknown>>
): React.ReactElement => {
  const { projectID } = useParams<{ projectID: string }>();
  const { showSuccess } = useToaster();
  const { mutate: sendInvitationMutation, isLoading } = useSendInvitationMutation(
    {},
    {
      onSuccess: () => {
        showSuccess('Invitation sent successfully');
        getUsersRefetch();
      }
    }
  );

  return (
    <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
      <SplitButton
        text="Invite as"
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
                userID: data.ID
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
                userID: data.ID
              }
            })
          }
        />
      </SplitButton>
    </Layout.Vertical>
  );
};

export { UserName, UserEmail };
