import React from 'react';
import { ButtonProps, Layout, Popover, SplitButton, Text } from '@harnessio/uicore';
import { PopoverInteractionKind } from '@blueprintjs/core';
import { Color, FontVariation, PopoverProps } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { usePermissions } from '@utils';

interface RbacCustomButtonProps {
  permission: string;
}
declare type SplitButtonProps = Omit<ButtonProps, 'rightIcon'> & {
  className?: string;
  dropdownDisabled?: boolean;
  popoverProps?: PopoverProps;
};

const RBACSplitButton = ({
  permission,
  dropdownDisabled,
  children,
  ...props
}: React.PropsWithChildren<RbacCustomButtonProps & SplitButtonProps>): React.ReactElement => {
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
      <SplitButton {...props} disabled={props.disabled || disabled} dropdownDisabled={dropdownDisabled || disabled}>
        {children}
      </SplitButton>
    </Popover>
  );
};

export default RBACSplitButton;
