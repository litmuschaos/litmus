import React, { ReactElement, useEffect, useState } from 'react';
import cx from 'classnames';
import { NavLink as Link, NavLinkProps } from 'react-router-dom';
import { Text, Layout, Container, TextProps, Popover } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core';
import { useLogout, useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import ProjectSelectorController from '@controllers/ProjectSelector';
import NavExpandable from '@components/NavExpandable';
import { getUserDetails } from '@utils';
import { PermissionGroup } from '@models';
import css from './SideNav.module.scss';

interface SidebarLinkProps extends NavLinkProps {
  label: string;
  icon?: IconName;
  className?: string;
  textProps?: TextProps;
}

const SideNavCollapseButton: React.FC<{ isExpanded: boolean; onClick: () => void }> = ({ isExpanded, onClick }) => {
  return (
    <Container
      className={cx(css.sideNavResizeBtn, {
        [css.collapse]: isExpanded,
        [css.expand]: !isExpanded
      })}
      onMouseEnter={e => e.stopPropagation()}
      onMouseLeave={e => e.stopPropagation()}
      onClick={onClick}
    >
      <Popover
        content={
          <Text color={Color.WHITE} padding="small">
            {isExpanded ? 'collapse' : 'expand'}
          </Text>
        }
        portalClassName={css.popover}
        popoverClassName={Classes.DARK}
        interactionKind={PopoverInteractionKind.HOVER}
        position={Position.LEFT}
      >
        <Icon className={css.triangle} name="symbol-triangle-up" size={12} />
      </Popover>
    </Container>
  );
};

export const SidebarLink: React.FC<SidebarLinkProps> = ({ label, icon, className, textProps, ...others }) => (
  <Link className={cx(css.link, className)} activeClassName={css.selected} {...others}>
    <Text icon={icon} className={css.text} {...textProps}>
      {label}
    </Text>
  </Link>
);

export const SIDE_NAV_EXPAND_TIMER = 500;

export default function SideNav(): ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();
  const { forceLogout } = useLogout();
  const { projectRole } = getUserDetails();
  const accountScopedPaths = useRouteWithBaseUrl('account');
  const collapseByDefault = false;
  const [sideNavHovered, setSideNavhovered] = useState<boolean>(false);
  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(!collapseByDefault);

  useEffect(() => {
    const timer =
      sideNavHovered &&
      setTimeout(() => {
        setSideNavExpanded(true);
      }, SIDE_NAV_EXPAND_TIMER);

    return () => {
      timer && clearTimeout(timer);
    };
  }, [sideNavHovered]);

  const isPathPresent = (path: string): boolean => {
    return window.location.pathname.includes(path);
  };

  return (
    <div
      className={cx(css.main, {
        [css.sideNavExpanded]: sideNavExpanded,
        [css.newNav]: true
      })}
      onMouseEnter={() => {
        /* istanbul ignore next */
        !sideNavExpanded && setSideNavhovered(true);
      }}
      onMouseLeave={() => {
        /* istanbul ignore next */
        !sideNavExpanded && setSideNavhovered(false);
      }}
    >
      <div>
        {isPathPresent('settings') ? (
          <Layout.Vertical spacing="small" padding={{ top: 'large' }}>
            <SidebarLink label={'Settings'} to={accountScopedPaths.toAccountSettingsOverview()} />
          </Layout.Vertical>
        ) : (
          <Layout.Vertical spacing="small">
            <ProjectSelectorController />
            <SidebarLink label={'Overview'} to={paths.toDashboard()} />
            <SidebarLink label={'Chaos Experiments'} to={paths.toExperiments()} />
            <SidebarLink label={'Environments'} to={paths.toEnvironments()} />
            <SidebarLink label={'Resilience Probes'} to={paths.toChaosProbes()} />
            <SidebarLink label={'ChaosHubs'} to={paths.toChaosHubs()} />
            {projectRole === PermissionGroup.OWNER && (
              <NavExpandable title="Project Setup" route={paths.toProjectSetup()}>
                <SidebarLink label={'Members'} to={paths.toProjectMembers()} />
                <SidebarLink label={'GitOps'} to={paths.toGitops()} />
                <SidebarLink label={'Image Registry'} to={paths.toImageRegistry()} />
              </NavExpandable>
            )}
          </Layout.Vertical>
        )}
      </div>
      <Container className={css.bottomContainer} data-isroutepresent={isPathPresent('settings')}>
        {!isPathPresent('settings') && (
          <div className={css.iconContainer}>
            <Icon className={css.icon} name={'chaos-litmuschaos'} size={200} />
          </div>
        )}
        <div className={css.titleContainer}>
          {isPathPresent('settings') ? (
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              className={css.logOutContainer}
              onClick={forceLogout}
            >
              <Icon name="log-out" color={Color.WHITE} />
              <Text font={{ variation: FontVariation.BODY }} color={Color.WHITE}>
                Sign Out
              </Text>
            </Layout.Horizontal>
          ) : (
            <Layout.Vertical>
              <Text color={Color.WHITE} className={css.title}>
                {getString('litmus')} 3.0
              </Text>
            </Layout.Vertical>
          )}
        </div>
      </Container>

      <SideNavCollapseButton
        isExpanded={sideNavExpanded}
        onClick={() => {
          setSideNavExpanded(!sideNavExpanded);
        }}
      />
    </div>
  );
}
