import { Button, ButtonProps, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import React from 'react';
import { Classes, PopoverInteractionKind } from '@blueprintjs/core';
import { useStrings } from '@strings';
import { usePermissions } from '@utils';

interface RbacButtonProps extends ButtonProps {
  permission: string;
}

export default function RbacButton({ permission, ...rest }: RbacButtonProps): React.ReactElement {
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
    <Button
      {...rest}
      disabled={rest.disabled || disabled}
      tooltip={disabled ? toolTip : rest.tooltip ? rest.tooltip : undefined}
      tooltipProps={
        disabled
          ? {
              hoverCloseDelay: 50,
              className: Classes.DARK,
              interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY
            }
          : rest.tooltipProps
      }
    />
  );
}
