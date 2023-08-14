import type { Row } from 'react-table';
import React from 'react';
import { Color } from '@harnessio/design-system';
import { Button, ButtonVariation, DropDown, Layout, SelectOption, Text, useToaster } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import { ProjectMember, useRemoveInvitationMutation, useSendInvitationMutation } from '@api/auth';
interface MemberRow {
  row: Row<ProjectMember>;
}

const MemberName = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { username, userID } = data;
  const { getString } = useStrings();
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{username}</Text>
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('id')}: {userID}
      </Text>
    </Layout.Vertical>
  );
};

const MemberEmail = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { email } = data;
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{email}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

const MemberPermission = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { role } = data;
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{role}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

const MemberPermissionDropdown = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { role } = data;
  const [memberRole, setMemberRole] = React.useState<string>(role);
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
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <DropDown value={memberRole} items={rolesDropDown} onChange={option => setMemberRole(option.label)} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

const InvitationOperation = ({ row: { original: data } }: MemberRow): React.ReactElement => {
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
        showSuccess('Invitation sent successfully');
      }
    }
  );

  const { mutate: removeInvitationMutation, isLoading: removeLoading } = useRemoveInvitationMutation(
    {},
    {
      onSuccess: () => {
        showSuccess('Invitation removed successfully');
      }
    }
  );

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} spacing="medium">
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <DropDown
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
          text="Resend"
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
          text="Remove"
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  );
};

export { MemberName, MemberEmail, MemberPermission, InvitationOperation, MemberPermissionDropdown };
