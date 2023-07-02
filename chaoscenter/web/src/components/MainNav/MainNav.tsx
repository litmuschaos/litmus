import React, { useContext } from 'react';
import cx from 'classnames';
import { NavLink as Link } from 'react-router-dom';
import { Text, Layout, Avatar } from '@harness/uicore';
import { Icon } from '@harness/icons';
import { Color } from '@harness/design-system';
import { useStrings } from '@strings';
import { AppStoreContext } from '@context';
import { useLogout } from '@hooks';
import css from './MainNav.module.scss';

export const ChaosNavItem = (): React.ReactElement => {
  const { getString } = useStrings();
  return (
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
  );
};

export default function MainNav(): React.ReactElement {
  const { getString } = useStrings();
  const userData = useContext(AppStoreContext);
  const { forceLogout } = useLogout();
  return (
    <nav className={css.main}>
      <ul className={css.navList}>
        <ChaosNavItem />
      </ul>
      <ul className={css.navList}>
        <li className={css.navItem}>
          <Layout.Vertical
            flex
            spacing="xsmall"
            className={cx(css.navLink, css.settings, css.hoverNavLink)}
            onClick={forceLogout}
          >
            <Icon name="log-out" size={20} />
            <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hoverText}>
              {getString('signOut')}
            </Text>
          </Layout.Vertical>
        </li>
        {/* <li className={css.navItem}>
          <Link className={cx(css.navLink, css.settings, css.hoverNavLink)} activeClassName={css.active} to={'#'}>
            <Layout.Vertical flex spacing="xsmall">
              <Icon name="nav-settings" size={20} />
              <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hoverText}>
                {getString('accountSettings')}
              </Text>
            </Layout.Vertical>
          </Link>
        </li> */}
        <li className={css.navItem}>
          <Link className={cx(css.navLink, css.userLink, css.hoverNavLink)} activeClassName={css.active} to={'#'}>
            <Layout.Vertical flex spacing="xsmall">
              <Avatar
                name={userData?.currentUserInfo?.fullName ?? userData?.currentUserInfo?.username}
                email={userData?.currentUserInfo?.email}
                size="small"
                hoverCard={false}
              />
              <Text font={{ size: 'xsmall', align: 'center' }} color={Color.WHITE} className={css.hiddenText}>
                {getString('myProfile')}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
