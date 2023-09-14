import { Layout, Text } from '@harnessio/uicore';
import type { Row } from 'react-table';
import React from 'react';
import { Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import type { InviteUserDetails } from '@controllers/InviteNewMembers/types';

interface MemberRow {
  row: Row<InviteUserDetails>;
}

const UserName = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { username, userID, name } = data;
  const { getString } = useStrings();
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK}>{name ?? username}</Text>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '0.25rem' }}>
        <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
          {getString('id')}:
        </Text>
        <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1} width={100}>
          {userID}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

const UserEmail = ({ row: { original: data } }: MemberRow): React.ReactElement => {
  const { email } = data;
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{email}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
};

export { UserName, UserEmail };
