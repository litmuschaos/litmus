import { CardBody, Text } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import React from 'react';
import { Classes } from '@blueprintjs/core';
import { useStrings } from '@strings';
import css from './Options.module.scss';

interface OptionItemProps {
  icon: IconName;
  text: string;
  size: number;
  color?: string;
  disabled?: boolean;
  handler: () => void;
}

interface OptionsProps {
  handleDelete?: () => void;
  handleNavigate?: () => void;
  disabled?: boolean;
}

function OptionItem({ icon, size, text, color, handler, disabled }: OptionItemProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <div className={`${css.optionsBox} ${disabled && css.disabledButton}`} onClick={disabled ? void 0 : handler}>
      <Icon
        data-testid="optionItemIcon"
        name={icon}
        size={size}
        color={color}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      <Text
        color={color ? color : Color.BLACK}
        style={{ padding: '6px 5px' }}
        tooltip={disabled ? getString('faultShouldHaveAtleastOneProbe') : undefined}
      >
        {text}
      </Text>
    </div>
  );
}

export default function Options({ handleDelete, handleNavigate, disabled }: OptionsProps): React.ReactElement {
  return (
    <CardBody.Menu
      menuPopoverProps={{
        className: Classes.DARK
      }}
      menuContent={
        <>
          {handleDelete && (
            <OptionItem
              disabled={disabled}
              icon="main-trash"
              color={disabled ? Color.GREY_400 : Color.RED_600}
              text="Delete"
              size={19}
              handler={handleDelete}
            />
          )}
          {handleNavigate && (
            <OptionItem
              disabled={disabled}
              icon="command-resource-constraint"
              text="View"
              size={19}
              handler={handleNavigate}
            />
          )}
        </>
      }
    />
  );
}
