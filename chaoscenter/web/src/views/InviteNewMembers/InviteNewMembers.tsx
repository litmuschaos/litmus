import { FontVariation } from '@harnessio/design-system';
import { Container, ButtonVariation, Layout, Button, Text } from '@harnessio/uicore';
import React from 'react';
import { Icon } from '@harnessio/icons';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import Loader from '@components/Loader';
import type { GetUsersForInvitationOkResponse, User } from '@api/auth';
import { useStrings } from '@strings';
import InviteUsersTableView from './InviteUsersTable';

interface InviteNewMembersViewProps {
  isLoading: boolean;
  handleClose: () => void;
  data: User[];
  searchInput: React.ReactElement;
  getUsers: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUsersForInvitationOkResponse, unknown>>;
}

export default function InviteNewMembersView(props: InviteNewMembersViewProps): React.ReactElement {
  const { isLoading, data, handleClose, getUsers, searchInput } = props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }} width={750}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('chooseMembersAddTheProject')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Container width={'100%'}>{searchInput}</Container>
      <Layout.Vertical
        style={{ minHeight: data.length === 0 ? 400 : 0 }}
        flex={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Loader
          loading={isLoading}
          noData={{
            when: () => data.length === 0,
            messageTitle: getString('usersNotAvailableTitle'),
            message: getString('usersNotAvailableMessage')
          }}
        >
          <InviteUsersTableView users={data} getUsers={getUsers} />
        </Loader>
      </Layout.Vertical>
      <Container width="100%">
        <Button
          disabled={false}
          onClick={() => handleClose()}
          variation={ButtonVariation.SECONDARY}
          text={getString('cancel')}
        />
      </Container>
    </Layout.Vertical>
  );
}
