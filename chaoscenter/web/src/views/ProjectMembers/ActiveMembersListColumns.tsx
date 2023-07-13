import type { Row } from 'react-table';
import React from 'react';
import { Color } from '@harnessio/design-system';
import { Button, ButtonVariation, DropDown, Layout, SelectOption, Text } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { string } from 'yup/lib/locale';
import { useStrings } from '@strings';
import type { ProjectMember } from '@controllers/ActiveProjectMemberList/types';
import config from '@config';
interface MemberRow {
  row: Row<ProjectMember>;
}

interface SendInvitation {
  projectID: string;
  userID: string;
  role: string;
}

const MemberName = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { Username, UserID } = data;
  const { getString } = useStrings();
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{Username}</Text>
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('id')}: {UserID}
      </Text>
    </Layout.Vertical>
  );
};

const MemberEmail = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { Email } = data;
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{Email}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

const MemberPermission = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { Role } = data;
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{Role}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

const MemberPermissionDropdown = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { Role } = data;
  const [memberRole, setMemberRole] = React.useState<string>(Role);
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
  const { Role } = data;
  const [memberRole, setMemberRole] = React.useState<string>(Role);
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
  const handleResend = async (invData: SendInvitation): Promise<void> => {
    try {
      await fetch(`${config.restEndpoints.authUri}/send_invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invData)
      });
      //  if (response.ok) {
      //    const json = await response.json();
      //    setUserDetails({
      //      token: json.access_token,
      //      projectID: json.project_id,
      //      role: json.project_role
      //    });
      //    history.push(paths.toDashboardWithProjectID({ projectID: json.project_id }));
      //  } else {
      //    throw response;
      //  }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      //  setLoading(false);
      //  showError(e?.statusText);
    }
  };
  const handleRemove = async (invData: SendInvitation): Promise<void> => {
    try {
      await fetch(`${config.restEndpoints.authUri}/remove_invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invData)
      });
      //  if (response.ok) {
      //    const json = await response.json();
      //    setUserDetails({
      //      token: json.access_token,
      //      projectID: json.project_id,
      //      role: json.project_role
      //    });
      //    history.push(paths.toDashboardWithProjectID({ projectID: json.project_id }));
      //  } else {
      //    throw response;
      //  }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      //  setLoading(false);
      //  showError(e?.statusText);
    }
  };
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} spacing="medium">
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <DropDown value={memberRole} items={rolesDropDown} onChange={option => setMemberRole(option.label)} />
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="medium">
        <Button
          disabled={false}
          onClick={() => handleResend({ userID: data.UserID, projectID: projectID, role: data.Role })}
          variation={ButtonVariation.PRIMARY}
          text="Resend"
        />
        <Button
          disabled={false}
          onClick={() => handleRemove({ userID: data.UserID, projectID: projectID, role: data.Role })}
          variation={ButtonVariation.SECONDARY}
          text="Remove"
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  );
};

export { MemberName, MemberEmail, MemberPermission, InvitationOperation, MemberPermissionDropdown };
