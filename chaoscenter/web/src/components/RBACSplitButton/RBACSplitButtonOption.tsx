import React from 'react';
import { Layout, Popover, SplitButtonOption, Text } from '@harnessio/uicore';
import { IMenuItemProps, PopoverInteractionKind } from '@blueprintjs/core';
import { Color, FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { usePermissions } from '@utils';

interface RbacCustomButtonProps {
  permission: string;
}
declare type SplitButtonOptionProps = IMenuItemProps & {
  className?: string;
};

export const RBACSplitButtonOption = ({
  permission,
  ...props
}: RbacCustomButtonProps & SplitButtonOptionProps): React.ReactElement => {
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

  return (
    <Popover
      boundary={'viewport'}
      interactionKind={PopoverInteractionKind.HOVER}
      content={disabled ? toolTip : props.popoverProps?.content ? props.popoverProps.content : undefined}
    >
      <SplitButtonOption {...props} disabled={props.disabled || disabled} />
    </Popover>
  );
};
