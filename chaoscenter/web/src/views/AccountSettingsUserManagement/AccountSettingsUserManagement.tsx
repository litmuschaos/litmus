import { Color, FontVariation } from '@harnessio/design-system';
import { Button, ButtonVariation, Checkbox, Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import css from './AccountSettingsUserManagement.module.scss';

interface AccountSettingsUserManagementViewProps {
  searchInput: JSX.Element;
}

export default function AccountSettingsUserManagementView(
  props: AccountSettingsUserManagementViewProps
): React.ReactElement {
  const { searchInput } = props;

  return (
    <Layout.Vertical height={'100%'}>
      <Layout.Horizontal
        flex={{ justifyContent: 'space-between', alignItems: 'center' }}
        padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}
        style={{ gap: '2rem' }}
        background={Color.WHITE}
        className={css.subHeader}
      >
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '1rem' }}>
          <Button text={'New User'} variation={ButtonVariation.PRIMARY} icon="plus" />
          <Checkbox labelElement={<Text font={{ variation: FontVariation.SMALL }}>Show only enabled users</Text>} />
        </Layout.Horizontal>
        {searchInput}
      </Layout.Horizontal>
      <Container background={Color.AI_PURPLE_300} style={{ flexGrow: 1 }} padding="medium"></Container>
    </Layout.Vertical>
  );
}
