import React from 'react';
import cx from 'classnames';
import { NavLink as Link } from 'react-router-dom';
import { Text, Layout, Avatar } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { useAppStore } from '@context';
import { useLogout, useRouteWithBaseUrl } from '@hooks';
import css from './MainNav.module.scss';

export const LitmusNavItem = (): React.ReactElement => {
  const projectScopedPaths = useRouteWithBaseUrl();
  const { getString } = useStrings();

  return (
    <li className={css.navItem}>
      <Link
        className={cx(css.navLink, css.hoverNavLink, css.moduleLink)}
        isActive={(_, location) => !location.pathname.includes('/settings/')}
        activeClassName={css.active}
        to={projectScopedPaths.toDashboard}
      >
        <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" padding="medium">
          <Icon name="chaos-litmuschaos" size={30} />
          <Text
            font={{ weight: 'semi-bold', align: 'center' }}
            padding={{ bottom: 'xsmall' }}
            color={Color.WHITE}
            className={css.text}
          >
            {getString('litmus')}
          </Text>
        </Layout.Vertical>
      </Link>
    </li>
  );
};

export default function MainNav(): React.ReactElement {
  const accountScopedPaths = useRouteWithBaseUrl('account');
  const { getString } = useStrings();
  const { currentUserInfo } = useAppStore();
  const { forceLogout } = useLogout();

  return (
    <nav className={css.main}>
      <ul className={css.navList}>
        <LitmusNavItem />
      </ul>
      <ul className={css.navList}>
        <li className={css.navItem}>
          <Link
            className={cx(css.navLink, css.settings, css.hoverNavLink)}
            activeClassName={css.active}
            to={accountScopedPaths.toAccountSettingsOverview}
          >
            <Layout.Vertical flex spacing="xsmall">
              <Icon name="nav-settings" size={20} />
              <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hoverText}>
                {getString('settings')}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
        <li className={css.navItem}>
          <Layout.Vertical
            flex
            spacing="xsmall"
            className={cx(css.navLink, css.settings, css.hoverNavLink, css.logOutButton)}
            onClick={forceLogout}
          >
            <Icon name="log-out" size={20} />
            <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hoverText}>
              {getString('signOut')}
            </Text>
          </Layout.Vertical>
        </li>
        <li className={css.navItem}>
          <Link className={cx(css.navLink, css.userLink, css.hoverNavLink)} activeClassName={css.active} to={'#'}>
            <Layout.Vertical flex spacing="xsmall">
              <Avatar
                name={currentUserInfo?.fullName ?? currentUserInfo?.username}
                email={currentUserInfo?.email}
                size="small"
                hoverCard={false}
              />
              <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hiddenText}>
                {currentUserInfo?.fullName ?? currentUserInfo?.username}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
