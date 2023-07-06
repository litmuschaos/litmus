import type { Row } from 'react-table';
import React from 'react';
import { Color } from '@harnessio/design-system';
import { Layout, Text } from '@harnessio/uicore';
import type { ProjectMember } from '@controllers/ActiveProjectMembers/types';
import { useStrings } from '@strings';
interface MemberRow {
  row: Row<ProjectMember>;
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

export { MemberName, MemberEmail, MemberPermission };
