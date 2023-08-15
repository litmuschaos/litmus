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

export { UserName, UserEmail };
