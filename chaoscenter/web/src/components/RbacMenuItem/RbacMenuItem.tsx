import React from 'react';
import { IMenuItemProps, Menu, MenuItem, PopoverInteractionKind, MaybeElement } from '@blueprintjs/core';
import { Popover, Layout, Text } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import { FontVariation, Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { usePermissions } from '@utils';
import styles from './RbacMenuItem.module.scss';

export interface RbacMenuItemProps extends Omit<IMenuItemProps, 'icon'> {
  permission: string;
  icon?: IconName | MaybeElement;
}

const RbacMenuItem: React.FC<RbacMenuItemProps> = ({ permission, icon, ...restProps }) => {
  const { getString } = useStrings();
  const disabled = usePermissions({
    permission
  });

  const toolTip = (
    <Layout.Vertical padding="small">
      <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
        {getString('rbacHeader')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_200}>
        {getString('rbacDescription', { permission })}
      </Text>
    </Layout.Vertical>
  );

  if (!disabled) {
    return <Menu.Item {...restProps} icon={icon ? <Icon className={styles.icon} name={icon as IconName} /> : null} />;
  }

  return (
    <Popover
      openOnTargetFocus={false}
      fill
      usePortal
      hoverCloseDelay={50}
      interactionKind={PopoverInteractionKind.HOVER}
      content={toolTip}
      className={styles.popover}
      inheritDarkTheme={false}
    >
      <div
        onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          event.stopPropagation();
        }}
      >
        <MenuItem
          {...restProps}
          icon={icon ? <Icon className={styles.icon} name={icon as IconName} /> : null}
          disabled
        />
      </div>
    </Popover>
  );
};

export default RbacMenuItem;
