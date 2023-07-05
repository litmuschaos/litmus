import React, { ReactElement, useEffect, useState } from 'react';
import cx from 'classnames';
import { NavLink as Link, NavLinkProps } from 'react-router-dom';
import { Text, Layout, Container, TextProps, Popover } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core';
import { useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import ProjectSelectorController from '@controllers/ProjectSelector/ProjectSelector';
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
      onMouseEnter={/* istanbul ignore next */ e => e.stopPropagation()}
      onMouseLeave={/* istanbul ignore next */ e => e.stopPropagation()}
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
  const collapseByDefault = false;
  const [sideNavHovered, setSideNavhovered] = useState<boolean>(false);
  const [sideNavExpanded, setSideNavExpanded] = useState<boolean>(!collapseByDefault);
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();

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
        <Layout.Vertical spacing="small">
          <ProjectSelectorController />
          <SidebarLink label={'Overview'} to={paths.toDashboard()} />
          <SidebarLink label={'Chaos Experiments'} to={paths.toExperiments()} />
          <SidebarLink label={'ChaosHubs'} to={paths.toChaosHubs()} />
          <SidebarLink label={'Environments'} to={paths.toEnvironments()} />
        </Layout.Vertical>
      </div>
      <Container className={css.bottomContainer}>
        <div className={css.iconContainer}>
          <Icon className={css.icon} name={'chaos-litmuschaos'} size={200} />
        </div>
        <div className={css.titleContainer}>
          <Layout.Vertical>
            <Text color={Color.WHITE} className={css.title}>
              {getString('litmus')} 3.0
            </Text>
          </Layout.Vertical>
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
